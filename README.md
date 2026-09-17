# Nexa Mail

<p align="center">
  <img src="mail-vue/public/mail-pwa-512.png" width="80" height="80" alt="Nexa Mail">
</p>

简体中文 | [English](README-en.md)

Nexa Mail 是面向自用部署的邮件服务，基于 MIT 开源项目 Cloud Mail 进行品牌定制与二次开发，并非从零原创的底层实现。服务使用 Nexa Mail 品牌，保留上游许可证与版权声明。

本仓库用于维护部署代码。计划对外提供的是部署后的邮件服务；本说明不会改变仓库的实际可见性，也不会部署或删除任何资源。

## 项目组成

- `mail-vue/`：Vue 3 / Element Plus 前端、登录页、管理界面和 PWA。
- `mail-worker/`：Cloudflare Workers 后端，使用 D1、KV、R2，支持邮件收发、Resend、Telegram 通知、OAuth 等现有能力。
- `.github/workflows/deploy-cloudflare.yml`：现有构建与部署流程。
- `LICENSE`：保留的 MIT 许可证及原版权声明。

## 第一阶段品牌定制

- 产品标题、页面描述、新安装的默认标题与公告标题使用 Nexa Mail。
- favicon、PWA（192 / 512 像素）、加载画面、登录页及侧栏使用维护者提供的蓝色 N 邮箱 Logo；仅按尺寸导出，不改变图案。
- 删除登录页和系统设置里的上游宣传链接、捐赠入口及自动查询上游版本的请求。GitHub OAuth 和 Telegram 通知功能保留。
- 不改变邮件业务逻辑、API 路径、数据库结构、Cloudflare bindings 或 OAuth 流程。

## 已部署实例的兼容处理

新建数据库使用新的默认品牌值。已有数据库不会自动迁移或覆盖标题：前端读取设置时，仅把完全等于旧默认值 `Cloud Mail` 的 `title` 和 `noticeTitle` 显示为 `Nexa Mail`。自定义标题、公告正文和其他配置保持原样；不会在读取时写回 D1 或 KV。

如管理员曾在自定义标题、公告正文或背景图片中加入上游名称或链接，请在系统设置里人工确认并调整。这些用户配置不会被批量改写。已有 PWA / 浏览器图标可能需要刷新缓存或重新安装后更新。

## 开发与验证

使用 Node.js 24 和 pnpm 11，与现有部署工作流保持一致：

```sh
pnpm --dir mail-vue install --frozen-lockfile
node --test mail-vue/tests/branding.test.js
pnpm --dir mail-vue run build
```

发布构建输出到 `mail-worker/dist`。本地开发可运行 `pnpm --dir mail-vue run dev`，并使用现有 Worker 开发配置。

注意：

- `mail-vue/.env.remote` 的远程 API 地址按要求保留。不要将 remote 模式当作生产构建，也不要用个人邮件或真实凭据测试上游远程环境。
- 保留 `wrangler.toml` 中的 `name = "cloud-mail"`，以及其他 Wrangler 配置、数据库名、工作流资源名与 bindings，避免意外创建新资源。
- OAuth 请求中的旧 User-Agent 属于内部协议标识，未修改。
- `mail-worker` 的 `test` 脚本实际执行 Wrangler 部署，并非单元测试；不要把它当作安全的测试命令运行。
- 合并到 `main` 可能触发现有自动部署工作流，须先确认部署配置。PR 本身不执行部署。
- 不要提交访问令牌、OAuth client secret、邮件内容或生产凭据。

## 来源与许可证

本定制版本基于 Cloud Mail，原作者版权声明为 `Copyright (c) 2025 aslost`。根目录 [LICENSE](LICENSE) 保持原文不变；第三方依赖的许可证与 notices 同样保留。


