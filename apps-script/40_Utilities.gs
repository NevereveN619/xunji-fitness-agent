function ensureSheets_() {
  const ss = ss_();
  ensureSheet_(ss,CFG.SHEETS.DAILY,DAILY_HEADERS);
  ensureSheet_(ss,CFG.SHEETS.TRAINING,TRAINING_HEADERS);
  ensureSheet_(ss,CFG.SHEETS.LOG,LOG_HEADERS);
  ensureSheet_(ss,CFG.SHEETS.WRITE_QUEUE,WRITE_QUEUE_HEADERS);
  ensureSheet_(ss,CFG.SHEETS.FOOD_CACHE,FOOD_CACHE_HEADERS);
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function postJson_(url, key, payload) {
  const resp = UrlFetchApp.fetch(url,{method:'post',contentType:'application/json',headers:{Authorization:'Bearer ' + key},payload:JSON.stringify(payload),muteHttpExceptions:true});
  const code = resp.getResponseCode();
  const text = resp.getContentText();
  if (code < 200 || code >= 300) throw new Error(`HTTP ${code}: ${text.slice(0,500)}`);
  let json;
  try { json = JSON.parse(text); } catch (e) { throw new Error('Non-JSON response: ' + text.slice(0,500)); }
  if (json && json.error) throw new Error(String(json.error));
  return json && Object.prototype.hasOwnProperty.call(json,'res') ? json.res : json;
}

function flattenFood_(res) {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== 'object') return [];
  if (Array.isArray(res.days)) {
    const out = [];
    res.days.forEach(day => {
      const dayDate = day.date || day.datestr;
      (day.meals || []).forEach(meal => (meal.foods || meal.items || []).forEach(food => { if (food && typeof food === 'object') out.push(Object.assign({},food,{date:food.date || dayDate,meal_type:food.meal_type || meal.meal_type || meal.type || meal.name})); }));
      const foods = Array.isArray(day.foods) ? day.foods : (day.foods && Array.isArray(day.foods.records) ? day.foods.records : []);
      foods.forEach(food => { if (food && typeof food === 'object') out.push(Object.assign({},food,{date:food.date || dayDate})); });
    });
    return out;
  }
  for (const key of ['foods','records','items']) if (Array.isArray(res[key])) return res[key];
  return [];
}

function gramPerUnit_(item) {
  const unit = String(item.unit || 'g').toLowerCase();
  if (unit === 'g' || unit === '克') return 1;
  const units = item.units || (item.ntr && item.ntr.foodUnit) || [];
  const matched = units.find(u => String(u.unit || '').toLowerCase() === unit);
  if (!matched) return 1;
  const count = num_(matched.count) || 1;
  const gram = num_(matched.gram);
  return gram > 0 ? gram / count : 1;
}

function mergeDaily_(updates) {
  const sheet = ss_().getSheetByName(CFG.SHEETS.DAILY);
  const existing = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,DAILY_HEADERS.length).getValues() : [];
  const map = {};
  existing.forEach(row => { const date = normalizeDateCell_(row[0]); if (date) { row[0] = date; map[date] = row; } });
  const syncAt = Utilities.formatDate(new Date(),CFG.TZ,'yyyy-MM-dd HH:mm:ss');
  updates.forEach(u => {
    const date = String(u.date || '').slice(0,10);
    if (!date) return;
    const row = map[date] || [date,'','','','','','','','',''];
    if (u.weight != null) row[1] = u.weight;
    if (u.bodyfat != null) row[2] = u.bodyfat;
    if (u.kcal != null) row[3] = u.kcal;
    if (u.protein != null) row[4] = u.protein;
    if (u.fat != null) row[5] = u.fat;
    if (u.carb != null) row[6] = u.carb;
    if (u.waist != null) row[7] = u.waist;
    row[8] = syncAt;
    map[date] = row;
  });
  const rows = Object.values(map).sort((a,b) => String(b[0]).localeCompare(String(a[0])));
  if (sheet.getLastRow() > 1) sheet.getRange(2,1,sheet.getLastRow()-1,DAILY_HEADERS.length).clearContent();
  if (rows.length) sheet.getRange(2,1,rows.length,DAILY_HEADERS.length).setValues(rows);
}

function replaceTrainingWindow_(startDate, endDate, newRows) {
  const sheet = ss_().getSheetByName(CFG.SHEETS.TRAINING);
  const existing = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,TRAINING_HEADERS.length).getValues() : [];
  const kept = existing.filter(row => { const date = normalizeDateCell_(row[0]); return !date || date < startDate || date > endDate; });
  const rows = kept.concat(newRows).sort((a,b) => String(b[0]).localeCompare(String(a[0])));
  if (sheet.getLastRow() > 1) sheet.getRange(2,1,sheet.getLastRow()-1,TRAINING_HEADERS.length).clearContent();
  if (rows.length) sheet.getRange(2,1,rows.length,TRAINING_HEADERS.length).setValues(rows);
}

function runLogged_(task, fn) { try { const detail = fn() || ''; log_(task,'ok',detail); } catch (e) { log_(task,'error',String(e && e.message ? e.message : e)); throw e; } }
function log_(task,status,detail) { const sheet = ss_().getSheetByName(CFG.SHEETS.LOG); if (sheet) sheet.appendRow([Utilities.formatDate(new Date(),CFG.TZ,'yyyy-MM-dd HH:mm:ss'),task,status,String(detail || '').slice(0,500)]); }
function today_() { return Utilities.formatDate(new Date(),CFG.TZ,'yyyy-MM-dd'); }
function daysAgo_(n) { const d = new Date(); d.setDate(d.getDate()-n); return Utilities.formatDate(d,CFG.TZ,'yyyy-MM-dd'); }
function dateRange_(startDate,endDate) { const out=[]; const current=new Date(startDate+'T12:00:00+08:00'); const end=new Date(endDate+'T12:00:00+08:00'); while(current<=end){out.push(Utilities.formatDate(current,CFG.TZ,'yyyy-MM-dd'));current.setDate(current.getDate()+1);} return out; }
function normalizeDateCell_(value) { if (!value) return ''; if (Object.prototype.toString.call(value)==='[object Date]' && !isNaN(value)) return Utilities.formatDate(value,CFG.TZ,'yyyy-MM-dd'); const m=String(value).match(/\d{4}-\d{2}-\d{2}/); return m ? m[0] : ''; }
function num_(value) { const n=Number(value); return Number.isFinite(n) ? n : 0; }
function round_(value,digits) { const p=Math.pow(10,digits || 0); return Math.round(value*p)/p; }
