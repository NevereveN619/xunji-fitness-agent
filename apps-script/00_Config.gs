const CFG = {
  TZ: 'Asia/Shanghai',
  RECENT_DAYS: 7,
  FOOD_BACKFILL_DAYS: 35,
  BODY_BACKFILL_DAYS: 120,
  TRAIN_BACKFILL_DAYS: 35,
  FOOD_CACHE_DAYS: 180,
  SHEETS: {
    DAILY: 'Daily',
    TRAINING: 'Training',
    LOG: 'SyncLog',
    WRITE_QUEUE: 'WriteQueue',
    FOOD_CACHE: 'XunjiFoodCache'
  }
};

const API = {
  TRAIN_READ: 'https://trains.xunjiapp.cn/api_trains_for_llm_v2',
  FOOD_QUERY: 'https://eatings.xunjiapp.cn/open/food/query_gzip',
  FOOD_UPSERT: 'https://eatings.xunjiapp.cn/open/food/upsert_gzip',
  BODY_QUERY: 'https://api.xunjiapp.cn/open/body/query_gzip'
};

const DAILY_HEADERS = ['日期','体重(kg)','体脂(%)','热量(kcal)','蛋白质(g)','脂肪(g)','碳水(g)','腰围(cm)','同步时间','备注'];
const TRAINING_HEADERS = ['日期','训练标题','训练ID','动作','动作序号','组号','完成','重量','单位','次数','RPE','难度'];
const LOG_HEADERS = ['时间','任务','状态','详情'];
const WRITE_QUEUE_HEADERS = ['created_at','status','action','date','meal_type','name','amount','unit','cal','protein','fat','carb','confirmed','detail','result'];
const FOOD_CACHE_HEADERS = ['name','uniquekey','cal_per100','protein_per100','fat_per100','carb_per100','units_json','last_seen_date','last_meal_type','source','updated_at','raw_json'];

function prop_(name) {
  return PropertiesService.getScriptProperties().getProperty(name) || '';
}

function requireConfig_() {
  const required = ['SPREADSHEET_ID','XUNJI_TRAIN_KEY','XUNJI_FOOD_KEY','XUNJI_BODY_KEY'];
  const missing = required.filter(name => !prop_(name));
  if (missing.length) throw new Error('Missing Script Properties: ' + missing.join(', '));
}

function ss_() {
  const id = prop_('SPREADSHEET_ID');
  if (!id) throw new Error('Missing Script Property: SPREADSHEET_ID');
  return SpreadsheetApp.openById(id);
}

function deploymentId_() {
  const id = prop_('SPREADSHEET_ID');
  return id ? id.slice(-8) : 'local';
}
