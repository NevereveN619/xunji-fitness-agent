# Implementation notes

- Xunji quick-entry semantics are represented internally as `amount=100`, `unit=g`, with `foodUnit` declaring `1份 = 100g`.
- Treating one serving as `1g` causes nutrition values to appear scaled down.
- Food-history reads can be reused to build `XunjiFoodCache`; a separate global food-search endpoint is not required for the core workflow.
- Quick-entry calories should stay consistent with protein*4 + carbohydrate*4 + fat*9.
