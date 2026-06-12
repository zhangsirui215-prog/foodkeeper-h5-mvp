# GitHub Pages 部署 Spec

## Why

项目已完成全部功能开发和本地验证，需要部署到 GitHub Pages 以提供公开可访问的在线演示地址。

## What Changes

- 将当前分支 `trae/solo-agent-6Ow9jE` 的代码合并到 `main` 分支并推送
- 通过 GitHub API 启用 GitHub Pages（从 `main` 分支的 `/` 根目录部署）
- 验证部署成功并获取公开访问 URL

## Impact

- 无代码修改，仅部署操作
- 影响仓库：`SaulShen/foodkeeper-h5-mvp`
- 部署方式：GitHub Pages（`https://saulshen.github.io/foodkeeper-h5-mvp/`）

## Requirements

### Requirement: 代码推送

系统 SHALL 将当前工作分支的代码合并到 `main` 分支并推送到远程仓库。

#### Scenario: 合并并推送
- **WHEN** 执行 `git checkout main && git merge trae/solo-agent-6Ow9jE && git push origin main`
- **THEN** `main` 分支包含最新的项目代码（含碳足迹厨房、PWA 等全部功能）

### Requirement: 启用 GitHub Pages

系统 SHALL 通过 GitHub API 为仓库启用 GitHub Pages。

#### Scenario: 启用 Pages
- **WHEN** 调用 GitHub API `POST /repos/SaulShen/foodkeeper-h5-mvp/pages`
- **THEN** Pages 配置为从 `main` 分支的 `/` 根目录部署

#### Scenario: 验证部署
- **WHEN** 查询 GitHub API `GET /repos/SaulShen/foodkeeper-h5-mvp/pages`
- **THEN** 返回 `status: deployed` 和公开访问 URL

### Requirement: 访问验证

系统 SHALL 验证部署后的页面可正常访问。

#### Scenario: HTTP 访问
- **WHEN** 请求 `https://saulshen.github.io/foodkeeper-h5-mvp/`
- **THEN** 返回 HTTP 200，内容为 `index.html`