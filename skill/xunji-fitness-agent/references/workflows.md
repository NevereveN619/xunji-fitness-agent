# Workflows

## Log food

1. Resolve the user's current local date.
2. Determine whether the user actually ate the food or is only planning it.
3. Check current-day queue/data for likely duplicates.
4. Classify the food:
   - ordinary food + measured weight -> exact XunjiFoodCache match -> `food_cached_and_log`;
   - exact packaged product -> use package label values;
   - restaurant/photo/mixed meal -> estimate P/F/C and use `food_custom_and_log`.
5. Follow the user's authorization preference.
6. Queue the item.
7. Re-read the queue and report the actual state.

## Analyze today's intake

Read today's Daily row and current-day WriteQueue. Do not double-count a PENDING item as if Daily already includes it.

## Analyze fat-loss progress

Read at least 7-14 recent days when available. Separate daily noise from weight trend. Compare calorie/protein consistency, then add training context.

## Analyze training

Compare like-for-like exercise history. Identify whether progress comes from load, reps, sets, or easier execution/variation.
