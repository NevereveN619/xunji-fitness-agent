function processWriteQueue() {
  requireConfig_();
  ensureSheets_();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;

  try {
    const sheet = ss_().getSheetByName(CFG.SHEETS.WRITE_QUEUE);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    const rows = sheet.getRange(2,1,lastRow-1,WRITE_QUEUE_HEADERS.length).getValues();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;
      const status = String(row[1] || '').trim().toUpperCase();
      const confirmed = row[12] === true || String(row[12] || '').trim().toUpperCase() === 'TRUE';
      if (status !== 'PENDING' || !confirmed) continue;

      sheet.getRange(rowNumber,2).setValue('PROCESSING');
      SpreadsheetApp.flush();
      try {
        const action = String(row[2] || '').trim();
        const result = action === 'food_cached_and_log' ? writeCachedFood_(row,rowNumber) : action === 'food_custom_and_log' ? writeQuickFood_(row,rowNumber) : (() => { throw new Error('Unsupported action: ' + action); })();
        sheet.getRange(rowNumber,2).setValue('DONE');
        sheet.getRange(rowNumber,15).setValue(String(result).slice(0,500));
      } catch (e) {
        const message = String(e && e.message ? e.message : e);
        const retryable = /too frequent|retry|429/i.test(message);
        sheet.getRange(rowNumber,2).setValue(retryable ? 'PENDING' : 'ERROR');
        sheet.getRange(rowNumber,15).setValue(message.slice(0,500));
      }
      return; // one write per trigger run to respect API rate limits
    }
  } finally {
    lock.releaseLock();
  }
}

function writeQuickFood_(row, rowNumber) {
  const date = String(row[3] || '').slice(0,10);
  const mealType = normalizeMealType_(row[4]);
  const name = String(row[5] || '').trim();
  const protein = num_(row[9]);
  const fat = num_(row[10]);
  const carb = num_(row[11]);
  if (!date || !name) throw new Error('Missing date or food name');
  if (protein < 0 || fat < 0 || carb < 0 || protein + fat + carb <= 0) throw new Error('Invalid macros');

  const cal = round_(protein * 4 + carb * 4 + fat * 9, 1);
  const serving = [{unit:'份',gram:100}];
  const food = {date:date,meal_type:mealType,name:name,amount:100,unit:'g',uniquekey:quickRecordId_(row,rowNumber),ntr:{cal:cal,protein:protein,fat:fat,carb:carb,foodpic:'',foodUnit:serving}};
  postJson_(API.FOOD_UPSERT, prop_('XUNJI_FOOD_KEY'), {client_request_id:queueRequestId_(rowNumber,'quick'),dry_run:false,foods:[food]});
  refreshFoodAfterWrite_(date);
  return `${date} ${mealType} quick entry: ${name}`;
}

function writeCachedFood_(row, rowNumber) {
  const date = String(row[3] || '').slice(0,10);
  const mealType = normalizeMealType_(row[4]);
  const name = String(row[5] || '').trim();
  const amount = num_(row[6]);
  const unit = String(row[7] || 'g').trim() || 'g';
  if (!date || !name || amount <= 0) throw new Error('Missing date, food name, or amount');

  const cached = findCachedFoodByName_(name);
  if (!cached) throw new Error('Food not found in XunjiFoodCache: ' + name);
  const raw = cached.raw || {};
  const food = {date:date,meal_type:mealType,name:raw.name || cached.name,amount:amount,unit:unit,uniquekey:raw.uniquekey || cached.uniquekey,ntr:raw.ntr || {cal:cached.cal,protein:cached.protein,fat:cached.fat,carb:cached.carb}};
  if (Array.isArray(raw.units)) food.units = raw.units;
  if (raw.smallimg != null) food.smallimg = raw.smallimg;

  postJson_(API.FOOD_UPSERT, prop_('XUNJI_FOOD_KEY'), {client_request_id:queueRequestId_(rowNumber,'cache'),dry_run:false,foods:[food]});
  refreshFoodAfterWrite_(date);
  return `${date} ${mealType} cached food: ${food.name} ${amount}${unit}`;
}

function refreshFoodAfterWrite_(date) {
  Utilities.sleep(800);
  try { syncFood_(date,date); } catch (e) { log_('write-refresh','error',String(e && e.message ? e.message : e)); }
}

function quickRecordId_(row, rowNumber) {
  const created = String(row[0] || '').replace(/[^0-9]/g,'').slice(0,14);
  return `quick-gpt-${deploymentId_()}-${created || rowNumber}-r${rowNumber}`;
}

function queueRequestId_(rowNumber, suffix) {
  return `xunji-sheet-${deploymentId_()}-r${rowNumber}-${suffix}`;
}

function normalizeMealType_(value) {
  const v = String(value || '').trim().toLowerCase();
  const map = {morning:'morning',breakfast:'morning','早餐':'morning',noon:'noon',lunch:'noon','午餐':'noon',night:'night',dinner:'night','晚餐':'night','noon-added':'noon-added',snack:'noon-added','加餐':'noon-added'};
  return map[v] || 'noon-added';
}
