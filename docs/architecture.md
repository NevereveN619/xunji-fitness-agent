# Architecture

```text
Xunji
  ↕
Google Apps Script
  ↕
Google Sheet
  ├─ Daily
  ├─ Training
  ├─ XunjiFoodCache
  ├─ WriteQueue
  └─ SyncLog
  ↕
ChatGPT + Xunji Fitness Agent Skill
```

Apps Script owns authentication and API calls. The Sheet is the shared state/queue layer. The Skill provides decision rules and operational behavior.
