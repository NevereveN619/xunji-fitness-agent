# Example: weighed food

User: `米饭 250g`

Workflow:
1. Use current local date.
2. Check for duplicates.
3. Find the matching `米饭` record in XunjiFoodCache.
4. Queue `food_cached_and_log` with amount 250 and unit g.
5. Re-read WriteQueue and report the actual status.
