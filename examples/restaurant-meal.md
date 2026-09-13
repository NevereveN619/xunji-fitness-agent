# Example: restaurant/photo meal

User shares a meal photo and says they ate it.

Workflow:
1. Use current local date.
2. Estimate portions and P/F/C; state meaningful uncertainty.
3. If standing authorization exists, queue immediately; otherwise ask for write confirmation.
4. Use `food_custom_and_log` as one serving.
5. Re-read queue status.
