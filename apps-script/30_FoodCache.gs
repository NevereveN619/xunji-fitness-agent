function rebuildFoodCache() {
  requireConfig_();
  ensureSheets_();
  const start = daysAgo_(CFG.FOOD_CACHE_DAYS - 1);
  const end = today_();
  const res = postJson_(API.FOOD_QUERY, prop_('XUNJI_FOOD_KEY'), {start_date:start,end_date:end,include_detail:true});
  const entries = flattenFood_(res);
  const count = updateFoodCacheFromEntries_(entries, true);
  log_('food-cache-rebuild','ok',`read ${entries.length}, cached ${count}`);
}

function updateFoodCacheFromEntries_(entries, replaceAll) {
  const sheet = ss_().getSheetByName(CFG.SHEETS.FOOD_CACHE);
  const existing = (!replaceAll && sheet.getLastRow() > 1) ? sheet.getRange(2,1,sheet.getLastRow()-1,FOOD_CACHE_HEADERS.length).getValues() : [];
  const map = {};
  existing.forEach(r => { const key = cacheKey_(r[0],r[1]); if (key) map[key] = r; });
  const now = Utilities.formatDate(new Date(),CFG.TZ,'yyyy-MM-dd HH:mm:ss');

  (entries || []).forEach(item => {
    const name = String(item.name || '').trim();
    const unique = String(item.uniquekey || item.uniqueKey || '').trim();
    const ntr = item.ntr || {};
    if (!name || !Object.keys(ntr).length || /^quick-/i.test(unique)) return;
    const date = String(item.date || item.datestr || '').slice(0,10);
    const key = cacheKey_(name,unique);
    if (!key) return;
    const row = [name,unique,num_(ntr.cal),num_(ntr.protein),num_(ntr.fat),num_(ntr.carb),JSON.stringify(item.units || ntr.foodUnit || []),date,String(item.meal_type || ''),unique ? 'xunji-history' : 'xunji-history-no-key',now,JSON.stringify(item)];
    const prev = map[key];
    if (!prev || String(date).localeCompare(String(prev[7] || '')) >= 0) map[key] = row;
  });

  const rows = Object.values(map).sort((a,b) => String(b[7] || '').localeCompare(String(a[7] || '')) || String(a[0] || '').localeCompare(String(b[0] || ''),'zh-CN'));
  if (sheet.getLastRow() > 1) sheet.getRange(2,1,sheet.getLastRow()-1,FOOD_CACHE_HEADERS.length).clearContent();
  if (rows.length) sheet.getRange(2,1,rows.length,FOOD_CACHE_HEADERS.length).setValues(rows);
  return rows.length;
}

function findCachedFoodByName_(name) {
  const sheet = ss_().getSheetByName(CFG.SHEETS.FOOD_CACHE);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const target = normalizeFoodName_(name);
  const candidates = sheet.getRange(2,1,sheet.getLastRow()-1,FOOD_CACHE_HEADERS.length).getValues().filter(r => normalizeFoodName_(r[0]) === target);
  if (!candidates.length) return null;
  candidates.sort((a,b) => String(b[7] || '').localeCompare(String(a[7] || '')));
  const r = candidates[0];
  let raw = {};
  try { raw = JSON.parse(String(r[11] || '{}')); } catch (e) {}
  return {name:String(r[0] || ''),uniquekey:String(r[1] || ''),cal:num_(r[2]),protein:num_(r[3]),fat:num_(r[4]),carb:num_(r[5]),raw:raw};
}

function cacheKey_(name, unique) {
  const n = normalizeFoodName_(name);
  if (!n) return '';
  return unique ? `${n}||${unique}` : n;
}

function normalizeFoodName_(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g,'');
}
