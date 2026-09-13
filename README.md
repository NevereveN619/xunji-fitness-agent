# 训记健身 Agent

一个轻量桥接，让 ChatGPT 类助手通过 Google Sheets 和 Apps Script 读取、分析并记录训记健身数据。

## 它能做什么

- 从训记同步体重、体脂、腰围、饮食汇总和训练历史；
- 根据训记历史构建可复用的食物缓存；
- 按真实克重记录普通食物；
- 将餐馆、照片或混合餐作为“一份”快速录入；
- 通过写入队列区分已排队、已完成和失败的写入；
- 提供一个 Skill，规定日期处理、重复检查、授权和健身数据分析行为。

## 安装

请参阅 [`docs/setup.md`](docs/setup.md)。基本流程是：

1. 创建 Google Sheet；
2. 创建 standalone Apps Script 项目，并复制 `apps-script/` 下的文件；
3. 在 Script Properties 中配置 `SPREADSHEET_ID` 和三个 Xunji API Key；
4. 运行 `setup()` 并完成授权；
5. 在支持访问该 Google Sheet 的 ChatGPT 环境中安装并使用 Skill。

## 隐私与安全

仓库不包含部署凭据或个人健身记录。API Key、Spreadsheet ID 等运行配置只应保存在 Apps Script 的 Script Properties 中，不要提交到 GitHub。详见 [`docs/privacy.md`](docs/privacy.md) 和 [`SECURITY.md`](SECURITY.md)。

## 重要说明

- `WriteQueue` 中出现一行，不代表训记已经完成写入；应等待 `DONE` 或进一步回读确认。
- 快速录入的内部语义是 `1份 = 100g` 映射，不是 `1g`。
- 饮食记录必须先确认用户所在时区的当前日期，并区分“已经吃”与“打算吃”。
- 本项目第一版只覆盖：训记 + Apps Script + Google Sheet + Skill。

## 许可证

MIT，详见 [`LICENSE`](LICENSE)。

## 当前状态

`v1.0.0` 已发布。源码已通过静态隐私扫描、必需文件检查和 Apps Script JavaScript 语法检查；尚未在全新部署中完成端到端验收，请将其视为公开的首个版本而非经过新环境验证的生产保证。

---

# Xunji Fitness Agent

A lightweight bridge that lets a ChatGPT-style assistant read, analyze, and log Xunji fitness data through Google Sheets and Apps Script.

## What it does

- syncs body-weight, body-fat, waist, diet totals, and training history from Xunji;
- builds a reusable Xunji food cache from history;
- logs measured ordinary foods with real gram amounts;
- logs restaurant/photo/mixed meals as one-serving quick entries;
- uses a write queue so the assistant can distinguish queued, completed, and failed writes;
- ships with a Skill that defines date handling, duplicate prevention, authorization, and analysis behavior.

## Install

See [`docs/setup.md`](docs/setup.md).

## Privacy

The repository contains no deployment credentials or personal fitness records. Runtime credentials belong in Apps Script Script Properties, never in GitHub. See [`docs/privacy.md`](docs/privacy.md) and [`SECURITY.md`](SECURITY.md).

## License

MIT. See [`LICENSE`](LICENSE).

## Status

`v1.0.0` is published. Static privacy, file-presence, and JavaScript syntax checks passed; fresh-deployment end-to-end acceptance has not been run.

