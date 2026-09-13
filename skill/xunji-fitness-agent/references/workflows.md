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

Read today's Daily row and current-day WriteQueue. Do not double-count a PENDING item as if Daily already includes it. Missing records mean unknown/incomplete data, not proof that the user consumed nothing.

## Analyze fat-loss progress

Read at least 7-14 recent days when available. Separate daily noise from weight trend. Compare calorie/protein consistency, data completeness, and training context. If the user asks why weight loss is faster/slower than expected, calculate Observed TDEE only when the data-quality rules in `analysis-and-review.md` are met.

## Estimate Observed TDEE

1. Pull 14 recent days of Daily data by default; extend to 21-28 days when needed.
2. Assess logging completeness and weight coverage before calculating.
3. Estimate weight trend from multiple measurements, not a single start/end comparison.
4. Calculate approximate Observed TDEE using average logged intake and the weight-trend energy equivalent.
5. Round the result and provide confidence plus the main source of uncertainty.
6. Use the estimate as evidence for a calorie-target discussion, not as an automatic target change.

## Weekly review

1. Read the latest 7 days and, when available, the prior 7 days.
2. Summarize weight trend, calorie average/completeness, protein consistency, and training.
3. Add Observed TDEE only if eligible.
4. Identify one primary bottleneck or uncertainty.
5. Recommend no more than 1-2 changes for the next week.
6. Keep the review compact and decision-oriented.

## Analyze training

Compare like-for-like exercise history. Identify whether progress comes from load, reps, sets, or easier execution/variation.
