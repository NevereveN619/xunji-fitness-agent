---
name: xunji-fitness-agent
description: Manage Xunji-linked body, diet, and training data through Google Sheets, including verified food logging, fat-loss analysis, Observed TDEE estimation, and weekly fitness reviews.
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
- Never interpret missing food, training, or weight records as proof that the event did not happen.

### Observed TDEE

When the user asks about maintenance calories, calorie targets, a fat-loss plateau, or why scale loss differs from logged intake, estimate Observed TDEE from recent real-world intake and weight trend when data quality is sufficient.

- Default to a 14-day window; extend to 21-28 days when the trend is noisy.
- Use weight trend rather than first-day vs last-day scale readings.
- Approximate: `Observed TDEE = average logged intake - (weight trend kg/day * 7700)`.
- Treat 7700 kcal/kg as an approximation, not a biological constant.
- Do not present a precise Observed TDEE when calorie logging is materially incomplete or weight coverage is too sparse. State that the estimate is low-confidence or unavailable.
- Report a rounded estimate or range and explain the main uncertainty.
- Do not automatically change the user's calorie target from one short/noisy window; prefer small changes supported by repeated trends.

Read `references/analysis-and-review.md` for the detailed eligibility and confidence rules.

### Weekly Review

When the user asks for a weekly review, weekly summary, “这周怎么样”, or equivalent, compare the latest 7 days with the previous 7 days when available.

Cover:
- weight trend;
- average logged calories and data completeness;
- protein consistency;
- training frequency and like-for-like progression;
- Observed TDEE when eligible;
- the main bottleneck or uncertainty;
- only 1-2 concrete changes for the next week.

Keep the review decision-oriented. Do not turn it into a long generic fitness lecture. Read `references/analysis-and-review.md` for the review format and safeguards.

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
- `references/analysis-and-review.md`
