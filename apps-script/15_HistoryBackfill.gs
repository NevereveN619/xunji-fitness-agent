const HISTORY_BACKFILL = {
  DEFAULT_START_DATE: '2020-01-01',
  FOOD_CHUNK_DAYS: 60,
  BODY_CHUNK_DAYS: 180,
  TRAIN_DAYS_PER_TICK: 180,
  TRAIN_LEGACY_URL: 'https://trains.xunjiapp.cn/api_trains_for_llm'
};

function startHistoricalBackfill() {
  requireConfig_();
  ensureSheets_();
  const props = PropertiesService.getScriptProperties();
  const start = props.getProperty('HISTORY_START_DATE') || HISTORY_BACKFILL.DEFAULT_START_DATE;
  const today = today_();

  const oldestFood = oldestDailyDate_(row => row[3] !== '' && row[3] != null);
  const oldestBody = oldestDailyDate_(row => [row[1], row[2], row[7]].some(v => v !== '' && v != null));
  const oldestTraining = oldestTrainingDate_();

  props.setProperties({
    HISTORY_ACTIVE: '1',
    HISTORY_EFFECTIVE_START: start,
    HISTORY_FOOD_CURSOR: start,
    HISTORY_FOOD_END: oldestFood ? addDaysHistory_(oldestFood, -1) : today,
    HISTORY_BODY_CURSOR: start,
    HISTORY_BODY_END: oldestBody ? addDaysHistory_(oldestBody, -1) : today,
    HISTORY_TRAIN_CURSOR: start,
    HISTORY_TRAIN_END: oldestTraining ? addDaysHistory_(oldestTraining, -1) : today
  });

  installHistoryBackfillTrigger_();
  log_('history-backfill-start', 'ok', JSON.stringify(historicalBackfillStatus()));
  historicalBackfillTick();
}

function historicalBackfillTick() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty('HISTORY_ACTIVE') !== '1') return;

    processHistoricalFoodChunk_(props);
    processHistoricalBodyChunk_(props);
    processHistoricalTrainingChunk_(props);

    const status = historicalBackfillStatus();
    if (status.done) {
      props.setProperty('HISTORY_ACTIVE', '0');
      removeHistoryBackfillTriggers_();
      log_('history-backfill-complete', 'ok', JSON.stringify(status));
    } else {
      log_('history-backfill-tick', 'ok', JSON.stringify(status));
    }
  } finally {
    lock.releaseLock();
  }
}

function stopHistoricalBackfill() {
  PropertiesService.getScriptProperties().setProperty('HISTORY_ACTIVE', '0');
  removeHistoryBackfillTriggers_();
  log_('history-backfill-stop', 'ok', JSON.stringify(historicalBackfillStatus()));
}

function historicalBackfillStatus() {
  const p = PropertiesService.getScriptProperties();
  const foodDone = cursorPastEnd_(p.getProperty('HISTORY_FOOD_CURSOR'), p.getProperty('HISTORY_FOOD_END'));
  const bodyDone = cursorPastEnd_(p.getProperty('HISTORY_BODY_CURSOR'), p.getProperty('HISTORY_BODY_END'));
  const trainingDone = cursorPastEnd_(p.getProperty('HISTORY_TRAIN_CURSOR'), p.getProperty('HISTORY_TRAIN_END'));
  return {
    active: p.getProperty('HISTORY_ACTIVE') === '1',
    start: p.getProperty('HISTORY_EFFECTIVE_START') || p.getProperty('HISTORY_START_DATE') || HISTORY_BACKFILL.DEFAULT_START_DATE,
    food: {cursor:p.getProperty('HISTORY_FOOD_CURSOR') || '', end:p.getProperty('HISTORY_FOOD_END') || '', done:foodDone},
    body: {cursor:p.getProperty('HISTORY_BODY_CURSOR') || '', end:p.getProperty('HISTORY_BODY_END') || '', done:bodyDone},
    training: {cursor:p.getProperty('HISTORY_TRAIN_CURSOR') || '', end:p.getProperty('HISTORY_TRAIN_END') || '', done:trainingDone},
    done: foodDone && bodyDone && trainingDone
  };
}

function processHistoricalFoodChunk_(props) {
  const cursor = props.getProperty('HISTORY_FOOD_CURSOR');
  const end = props.getProperty('HISTORY_FOOD_END');
  if (cursorPastEnd_(cursor, end)) return;
  const chunkEnd = minDateHistory_(addDaysHistory_(cursor, HISTORY_BACKFILL.FOOD_CHUNK_DAYS - 1), end);
  runLogged_('history-food', () => syncFood_(cursor, chunkEnd));
  props.setProperty('HISTORY_FOOD_CURSOR', addDaysHistory_(chunkEnd, 1));
}

function processHistoricalBodyChunk_(props) {
  const cursor = props.getProperty('HISTORY_BODY_CURSOR');
  const end = props.getProperty('HISTORY_BODY_END');
  if (cursorPastEnd_(cursor, end)) return;
  const chunkEnd = minDateHistory_(addDaysHistory_(cursor, HISTORY_BACKFILL.BODY_CHUNK_DAYS - 1), end);
  runLogged_('history-body', () => syncBody_(cursor, chunkEnd));
  props.setProperty('HISTORY_BODY_CURSOR', addDaysHistory_(chunkEnd, 1));
}

function processHistoricalTrainingChunk_(props) {
  const cursor = props.getProperty('HISTORY_TRAIN_CURSOR');
  const end = props.getProperty('HISTORY_TRAIN_END');
  if (cursorPastEnd_(cursor, end)) return;
  const chunkEnd = minDateHistory_(addDaysHistory_(cursor, HISTORY_BACKFILL.TRAIN_DAYS_PER_TICK - 1), end);
  const rows = [];
  dateRange_(cursor, chunkEnd).forEach(date => {
    const res = postJson_(HISTORY_BACKFILL.TRAIN_LEGACY_URL, prop_('XUNJI_TRAIN_KEY'), {datestr:date});
    (Array.isArray(res) ? res : []).forEach(record => rows.push(...parseLegacyTrainingRows_(record, date)));
    Utilities.sleep(650);
  });
  replaceTrainingWindow_(cursor, chunkEnd, rows);
  log_('history-training', 'ok', `training ${cursor}..${chunkEnd}: ${rows.length} completed sets`);
  props.setProperty('HISTORY_TRAIN_CURSOR', addDaysHistory_(chunkEnd, 1));
}

function parseLegacyTrainingRows_(record, fallbackDate) {
  if (!record || typeof record !== 'string') return [];
  const rows = [];
  const dateMatch = record.match(/^(\d{6})/);
  const date = dateMatch ? `20${dateMatch[1].slice(0,2)}-${dateMatch[1].slice(2,4)}-${dateMatch[1].slice(4,6)}` : fallbackDate;
  const idMatch = record.match(/id:(\d+)/);
  const localid = idMatch ? idMatch[1] : '';
  const titleMatch = record.match(/id:\d+,([^,]+)/);
  const title = titleMatch ? titleMatch[1].trim() : '训练';
  const parts = record.split(',').map(x => x.trim());
  let movement = null;
  let movementIndex = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const movementMatch = part.match(/^\d+\.?(.+)/);
    if (movementMatch && !part.includes('组') && !part.includes('kg') && !part.includes('次') && !part.startsWith('id:')) {
      movementIndex += 1;
      movement = movementMatch[1].trim();
      continue;
    }
    const setMatch = part.match(/^(\d+)组$/);
    if (!setMatch || !movement) continue;
    let weight = '';
    let reps = '';
    let unit = 'kg';
    for (const next of parts.slice(i + 1, i + 6)) {
      const weightMatch = next.match(/^(-?\d+(?:\.\d+)?)kg$/i);
      if (weightMatch) weight = Number(weightMatch[1]);
      const repsMatch = next.match(/^(\d+)次$/);
      if (repsMatch) reps = Number(repsMatch[1]);
    }
    rows.push([date,title,localid,movement,movementIndex,Number(setMatch[1]),true,weight,unit,reps,'','']);
  }
  return rows;
}

function oldestDailyDate_(predicate) {
  const sheet = ss_().getSheetByName(CFG.SHEETS.DAILY);
  if (!sheet || sheet.getLastRow() < 2) return '';
  const rows = sheet.getRange(2,1,sheet.getLastRow()-1,DAILY_HEADERS.length).getValues();
  const dates = rows.filter(predicate).map(r => normalizeDateCell_(r[0])).filter(Boolean).sort();
  return dates.length ? dates[0] : '';
}

function oldestTrainingDate_() {
  const sheet = ss_().getSheetByName(CFG.SHEETS.TRAINING);
  if (!sheet || sheet.getLastRow() < 2) return '';
  const values = sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues();
  const dates = values.map(r => normalizeDateCell_(r[0])).filter(Boolean).sort();
  return dates.length ? dates[0] : '';
}

function installHistoryBackfillTrigger_() {
  removeHistoryBackfillTriggers_();
  ScriptApp.newTrigger('historicalBackfillTick').timeBased().everyMinutes(5).create();
}

function removeHistoryBackfillTriggers_() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'historicalBackfillTick').forEach(t => ScriptApp.deleteTrigger(t));
}

function cursorPastEnd_(cursor, end) {
  return !cursor || !end || cursor > end;
}

function minDateHistory_(a, b) {
  return a <= b ? a : b;
}

function addDaysHistory_(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00+08:00');
  d.setDate(d.getDate() + days);
  return Utilities.formatDate(d, CFG.TZ, 'yyyy-MM-dd');
}
