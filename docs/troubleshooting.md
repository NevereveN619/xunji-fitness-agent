# Troubleshooting

## Queue stays PENDING
Check that the `processWriteQueue` time trigger exists and that `confirmed` is TRUE.

## Queue becomes ERROR
Read the `result` cell and `SyncLog`. Fix the cause before retrying to avoid duplicates.

## Food cache miss
Record the ordinary food once in Xunji, then run `rebuildFoodCache()`. Restaurant/mixed meals should normally use quick entry instead.

## Quick entry appears with the wrong amount
Quick entry uses internal `100g` serialization plus `1份 = 100g` unit metadata. Do not serialize one serving as `1g`.

## New-day food logged to yesterday
The assistant must resolve the user's current local date before creating a food record.
