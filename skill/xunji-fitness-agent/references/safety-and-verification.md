# Safety and verification

## Authorization
A user may explicitly grant standing authorization to log foods they report as consumed. Otherwise require an explicit instruction to record. Planned food is never treated as consumed.

## Duplicate prevention
Before adding a row, inspect current-day WriteQueue and available diet records. Treat same date + meal + food + amount, or an already-DONE equivalent entry, as a duplicate warning.

## Verification hierarchy
1. `PENDING`: queued only.
2. `DONE`: Apps Script reports processing completed.
3. Refreshed readback: strongest practical confirmation that downstream data reflects the write.

Never claim downstream success solely because a queue row exists.

## Privacy
Do not expose or store runtime credentials in the Skill. Credentials belong to the user's Apps Script project configuration.
