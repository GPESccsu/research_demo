# 重构计划（收尾版）

## 目标

完成从“单体前端文件”到“分层模块化”的收尾整理，降低维护成本，保证可持续迭代。

## 已完成项

- [x] 写作页迁移至 `src/pages/WritingPage.jsx`
- [x] 设置页迁移至 `src/pages/SettingsPage.jsx`
- [x] App 中移除已迁移的废弃逻辑与无效依赖
- [x] 统一 import 路径风格（去除冗余扩展后缀）
- [x] 补充前端 README
- [x] 补充后端 README
- [x] 新增架构文档
- [x] 维持 Windows 一键启动能力（`start_all.bat`）

## 后续建议

1. **继续拆分 App.jsx**
   - 将 Topic/Knowledge/Experiment 等模块继续迁移到 `src/pages/`。
2. **提炼共享常量与样式**
   - 将 `Icons`、静态 mock 数据、长 CSS 字符串进一步拆分。
3. **完善后端契约文档**
   - 增加任务请求/响应 JSON schema 与错误码说明。
4. **补齐自动化校验**
   - 为前后端分别配置可通过的 lint / test 基线。

## 验收标准

- 可构建：`npm run build` 成功。
- 可启动：`start_all.bat` 能拉起前后端开发服务。
- 文档齐全：frontend/backend/docs 三类文档完备。
