# ADR（Architecture Decision Records）

架构决策记录。每个 ADR 记录一个不可逆或高成本技术决策的 Context / Decision / Consequences。

## 索引

| 编号 | 标题                                   | 状态                                   |
| ---- | -------------------------------------- | -------------------------------------- |
| 0001 | token 存储方案                         | accepted（前端侧预留，后端联调期实施） |
| 0002 | 状态管理分层（react-query vs zustand） | accepted                               |
| 0003 | 构建分包与体积预算策略                 | accepted                               |

## 格式约定

- 文件名：NNNN-短标题.md（四位递增编号）。
- 章节：## Context（问题与约束）/ ## Decision（决策）/ ## Consequences（正反后果）/ ## Migration path（如适用）。
- 决策变更不修改旧 ADR，新增 ADR 并在旧 ADR 标注 superseded。
