# Analysis and review

## Observed TDEE

Observed TDEE is a real-world estimate inferred from logged calorie intake plus the user's body-weight trend. It complements formula-based TDEE estimates; it does not replace physiology or remove uncertainty from food logging and water-weight changes.

### Default window

Use 14 days by default. Extend to 21-28 days when scale weight is noisy, intake varies substantially, or the user has few weigh-ins.

### Minimum data quality

Prefer a quantitative estimate only when all of the following are reasonably true:

- at least 10 of the latest 14 days have usable calorie totals, or an equivalent completeness ratio for a longer window;
- at least 7 body-weight measurements span roughly 10 or more days;
- there is no obvious large block of missing intake that would dominate the result.

If those conditions are not met, do not manufacture a precise TDEE. Explain what is missing and, if useful, provide only a low-confidence directional interpretation.

### Weight trend

Prefer a trend fitted across all available weigh-ins. If a fitted trend is unavailable, compare smoothed/multi-day averages rather than a single first and last weigh-in.

Let `weight_trend_kg_per_day` be positive for weight gain and negative for weight loss.

### Approximation

Use:

`Observed TDEE ≈ average logged kcal/day - (weight_trend_kg_per_day × 7700 kcal/kg)`

Examples:

- losing 0.4 kg/week while averaging 2100 kcal/day -> approximate deficit ≈ 440 kcal/day -> Observed TDEE ≈ 2540 kcal/day;
- gaining 0.2 kg/week while averaging 2500 kcal/day -> approximate surplus ≈ 220 kcal/day -> Observed TDEE ≈ 2280 kcal/day.

Treat 7700 kcal/kg as an approximation. Short-term weight change also reflects glycogen, water, gut content, sodium, inflammation, and measurement noise.

### Reporting

Round the estimate to a practical level, usually the nearest 50 kcal/day, or report a range when uncertainty is meaningful.

Always report confidence:

- **High**: dense weight data, near-complete calorie logging, stable multi-week trend;
- **Medium**: adequate but imperfect coverage or moderate scale noise;
- **Low**: sparse weigh-ins, notable missing intake, or a very short/noisy window.

State the biggest source of uncertainty. Do not imply that formula-based and Observed TDEE must match exactly.

### Using the result

Use Observed TDEE to test whether the user's actual trend is consistent with their logged intake. It is especially useful for plateau questions and calorie-target calibration.

Do not make large calorie changes from one short window. Prefer a small adjustment, generally around 100-150 kcal/day, only when repeated trends support it. If intake logging is visibly incomplete, improve logging completeness before lowering calories.

## Weekly Review

A Weekly Review should answer: what changed, what likely caused it, and what should change next week?

Compare the latest 7 days with the previous 7 days when enough data exists.

### Review structure

1. **Weight trend**
   - latest 7-day average or smoothed trend;
   - change versus the prior week;
   - avoid overreacting to a single weigh-in.

2. **Diet**
   - average logged calories;
   - logging completeness;
   - average protein and number of days meeting the practical protein target when known;
   - identify obvious high-variance or incomplete days without assuming unrecorded food was not eaten.

3. **Training**
   - training frequency;
   - like-for-like changes in load, reps, sets, or RPE;
   - during fat loss, maintaining performance can count as a positive outcome.

4. **Observed TDEE**
   - include only if the data-quality threshold is met;
   - otherwise state why it is not yet reliable.

5. **Main bottleneck or uncertainty**
   - identify one primary issue, not a generic list of everything that could improve.

6. **Next-week actions**
   - recommend only 1-2 concrete changes;
   - keep them measurable and small enough to evaluate after another week.

### Example style

`本周7日均重下降约0.3kg，方向正常。平均记录热量约2100 kcal，但周六记录明显不完整，因此暂不建议继续降热量。蛋白质大多数天达标，训练4次且主要动作负重基本维持。下周只做两件事：补完整周六饮食记录；其余饮食保持不变，再观察7天。`

### Missing data rule

Missing data means unknown, not zero.

- no food entry ≠ fasting;
- no training entry ≠ definitely skipped training;
- no weigh-in ≠ unchanged body weight.

State data gaps explicitly when they affect the conclusion.
