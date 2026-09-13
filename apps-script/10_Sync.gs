function setup() {
  requireConfig_();
  ensureSheets_();
  initialBackfill();
  installTriggers();
}

function installTriggers() {
  const managed = new Set(['syncRecent','processWriteQueue']);
  ScriptApp.getProjectTriggers().filter(t => managed.has(t.getHandlerFunction())).forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncRecent').timeBased().everyHours(6).create();
  ScriptApp.newTrigger('processWriteQueue').timeBased().everyMinutes(5).create();
  log_('triggers','ok','Installed 6h sync and 5m write queue triggers');
}

function initialBackfill() {
  const today = today_();
  runLogged_('food-backfill', () => syncFood_(daysAgo_(CFG.FOOD_BACKFILL_DAYS - 1), today));
  runLogged_('body-backfill', () => syncBody_(daysAgo_(CFG.BODY_BACKFILL_DAYS - 1), today));
  runLogged_('training-backfill', () => syncTraining_(daysAgo_(CFG.TRAIN_BACKFILL_DAYS - 1), today));
}

function syncRecent() {
  requireConfig_();
  ensureSheets_();
  const today = today_();
  const start = daysAgo_(CFG.RECENT_DAYS - 1);
  runLogged_('food-recent', () => syncFood_(start, today));
  runLogged_('body-recent', () => syncBody_(start, today));
  runLogged_('training-recent', () => syncTraining_(start, today));
}

function syncFood_(startDate, endDate) {
  const res = postJson_(API.FOOD_QUERY, prop_('XUNJI_FOOD_KEY'), {start_date:startDate,end_date:endDate,include_detail:true});
  const entries = flattenFood_(res);
  updateFoodCacheFromEntries_(entries, false);
  const daily = {};

  entries.forEach(item => {
    const date = String(item.date || item.datestr || '').slice(0,10);
    if (!date) return;
    const ntr = item.ntr || {};
    let nutrients = item.nutrients_snapshot || item.nutrients || null;
    if (!nutrients && Object.keys(ntr).length) {
      const amount = num_(item.amount != null ? item.amount : item.count);
      const factor = (amount * gramPerUnit_(item)) / 100;
      nutrients = {cal:num_(ntr.cal)*factor,protein:num_(ntr.protein)*factor,fat:num_(ntr.fat)*factor,carb:num_(ntr.carb)*factor};
    }
    if (!nutrients) return;
    if (!daily[date]) daily[date] = {date:date,kcal:0,protein:0,fat:0,carb:0};
    daily[date].kcal += num_(nutrients.cal);
    daily[date].protein += num_(nutrients.protein);
    daily[date].fat += num_(nutrients.fat);
    daily[date].carb += num_(nutrients.carb);
  });

  const updates = Object.values(daily).map(x => ({date:x.date,kcal:round_(x.kcal,1),protein:round_(x.protein,1),fat:round_(x.fat,1),carb:round_(x.carb,1)}));
  mergeDaily_(updates);
  return `food ${updates.length} days / ${entries.length} entries`;
}

function syncBody_(startDate, endDate) {
  const res = postJson_(API.BODY_QUERY, prop_('XUNJI_BODY_KEY'), {start_date:startDate,end_date:endDate,types:['weight','bodyfat','weist'],include_latest:true,include_records:true,limit:500,offset:0});
  const byDate = {};
  (res.records || []).forEach(r => {
    const date = String(r.datestr || r.date || '').slice(0,10);
    if (!date || r.value == null) return;
    if (!byDate[date]) byDate[date] = {date:date};
    if (r.type === 'weight') byDate[date].weight = num_(r.value);
    if (r.type === 'bodyfat') byDate[date].bodyfat = num_(r.value);
    if (r.type === 'weist') byDate[date].waist = num_(r.value);
  });
  const updates = Object.values(byDate);
  mergeDaily_(updates);
  return `body ${updates.length} days / ${(res.records || []).length} entries`;
}

function syncTraining_(startDate, endDate) {
  const rows = [];
  dateRange_(startDate, endDate).forEach(date => {
    const res = postJson_(API.TRAIN_READ, prop_('XUNJI_TRAIN_KEY'), {schema_version:'train_open_api_v2',datestr:date,include_full_data:true});
    const trains = Array.isArray(res) ? res : (res.trains || []);
    trains.forEach(train => {
      const trainDate = String(train.datestr || date).slice(0,10);
      const title = train.title || '训练';
      const localid = train.localid != null ? String(train.localid) : '';
      (train.movements || []).forEach((movement, movementIndex) => {
        const sets = movement.sets || [];
        if (!sets.length) rows.push([trainDate,title,localid,movement.name || '',movementIndex+1,'','','','','','',movement.difficulty || '']);
        sets.forEach((set, setIndex) => rows.push([trainDate,title,localid,movement.name || '',movementIndex+1,set.index != null ? set.index : setIndex+1,set.done === false ? false : true,set.weight != null ? set.weight : '',set.unit || 'kg',set.reps != null ? set.reps : '',set.rpe != null ? set.rpe : '',movement.difficulty || '']));
      });
    });
    Utilities.sleep(200);
  });
  replaceTrainingWindow_(startDate, endDate, rows);
  return `training ${rows.length} sets`;
}
