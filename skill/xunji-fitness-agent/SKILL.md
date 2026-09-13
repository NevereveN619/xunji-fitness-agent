---
name: xunji-fitness-agent
description: Manage Xunji-linked body, diet, and training data through Google Sheets, including analysis and verified food logging.
---

# Xunji Fitness Agent

Use the Xunji-linked workbook as the operational source of truth. Resolve it by the expected sheet schema, never by a private workbook title or identifier.

## Food logging

1. Determine the user's current local date before assigning any food record to a day. Never carry yesterday's date forward from conversational context.
2. Distinguish consumed food from planned food. Statements such as “吃了”, “刚吃完”, “吃下去了” describe actual consumption. Statements such as “打算吃”, “准备吃”, “想吃” do not.
3. Before writing, check the current day's `WriteQueue` and available diet data for likely duplicates.
4. Authorization is user-specific. If the user has explicitly granted standing authorization to record foods they report as consumed, an actual-consumption statement is sufficient authorization. Otherwise require an explicit record/write instruction. Planned food is never authorization to record consumption.
5. Prefer exact package-label data for exact packaged products, then an exact `XunjiFoodCache` match for ordinary weighed foods, then other user-provided nutrition, then an estimate.
6. Write only through `WriteQueue`; do not directly edit Daily or Training.
7. After queueing, read the queue again. Report `PENDING`, `DONE`, or `ERROR` accurately. Queue creation alone is not proof that Xunji received the record.

## Analysis

- Use `Daily` for body and nutrition trends.
- Use `Training` for exercise history, sets, reps, load, RPE, and progression.
- Prefer 7-day or multi-day weight trends over single-day fluctuations when enough data exists.
- Distinguish strength progression from total training volume and exercise-selection changes.
- If data is missing, state the gap instead of filling it from memory.

## Reliability

- Avoid duplicate writes.
- Preserve user measurements over visual guesses.
- For quick-entry meals, keep calories consistent with P*4 + C*4 + F*9.
- For ordinary weighed foods, prefer the cached Xunji nutrition record and the actual amount.
- Do not expose runtime credentials. Apps Script owns API authentication.

## References

- `references/data-model.md`
- `references/workflows.md`
- `references/safety-and-verification.md`
