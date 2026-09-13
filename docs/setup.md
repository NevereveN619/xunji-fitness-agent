# Setup

1. Create a Google Sheet.
2. Create a standalone Google Apps Script project and copy every file from `apps-script/`.
3. Add four Script Properties: `SPREADSHEET_ID`, `XUNJI_TRAIN_KEY`, `XUNJI_FOOD_KEY`, and `XUNJI_BODY_KEY`.
4. Run `setup()` once and authorize the script.
5. Optionally run `rebuildFoodCache()` to backfill recent reusable foods.
6. Confirm the sheets `Daily`, `Training`, `SyncLog`, `WriteQueue`, and `XunjiFoodCache` exist.
7. Install/use the Skill in a ChatGPT environment that can access the Google Sheet.

Do not commit the real property values to GitHub.
