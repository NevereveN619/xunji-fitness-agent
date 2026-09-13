# Data model

## Daily
Columns: 日期, 体重(kg), 体脂(%), 热量(kcal), 蛋白质(g), 脂肪(g), 碳水(g), 腰围(cm), 同步时间, 备注.

## Training
Columns: 日期, 训练标题, 训练ID, 动作, 动作序号, 组号, 完成, 重量, 单位, 次数, RPE, 难度.

## XunjiFoodCache
Reusable nutrition metadata captured from Xunji history. Nutrition values are generally per 100g. Prefer exact normalized-name matches and the most recent record.

## WriteQueue
Columns: created_at, status, action, date, meal_type, name, amount, unit, cal, protein, fat, carb, confirmed, detail, result.

Supported actions:
- `food_custom_and_log`: one-serving quick entry for estimated/composite meals.
- `food_cached_and_log`: reuse a cached Xunji food with an explicit amount.

Statuses:
- `PENDING`: queued but not yet processed.
- `DONE`: Apps Script processed the request.
- `ERROR`: processing failed.

## SyncLog
Operational diagnostics for sync, triggers, cache rebuild, and write processing.
