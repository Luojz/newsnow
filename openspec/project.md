# Project Context

## Purpose
NewsNow 是一个优雅的新闻聚合应用，提供实时和热门新闻的阅读体验。主要目标包括：
- 提供简洁优雅的 UI 设计，优化阅读体验
- 实时更新热门新闻内容
- 支持 GitHub OAuth 登录和数据同步
- 30分钟默认缓存时长（登录用户可强制刷新）
- 基于源更新频率的自适应抓取间隔（最短2分钟）
- 支持 MCP (Model Context Protocol) 服务器

## Tech Stack
- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **路由**: TanStack Router
- **状态管理**: Jotai
- **样式**: UnoCSS (原子化 CSS)
- **后端**: Nitro (全栈框架)
- **数据库**: db0 (支持多种连接器，默认 better-sqlite3，生产环境推荐 Cloudflare D1)
- **部署**: Cloudflare Pages, Vercel, Docker
- **包管理器**: pnpm
- **测试**: Vitest
- **代码规范**: ESLint + TypeScript

## Project Conventions

### Code Style
- 使用 TypeScript 进行严格类型检查
- 采用 ESLint 配置 (@ourongxing/eslint-config)
- 使用 UnoCSS 原子化样式，遵循 Tailwind CSS 约定
- 组件使用 PascalCase 命名
- 文件名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 使用自动导入 (unimport) 管理依赖

### Architecture Patterns
- **全栈架构**: 前后端一体化，共享类型定义 (shared/ 目录)
- **数据源抽象**: 统一的新闻源接口，支持多种新闻网站
- **缓存策略**: 智能缓存机制，防止 IP 封禁
- **配置驱动**: 通过 JSON 配置文件管理新闻源和元数据
- **服务端渲染**: 使用 Nitro 提供高性能的服务端能力

### Testing Strategy
- 使用 Vitest 进行单元测试和集成测试
- 测试文件放置在 `server/**/*.test.ts`, `shared/**/*.test.ts`, `test/**/*.test.ts`
- 测试环境配置在 `vitest.config.ts`
- 鼓励为新功能编写测试，特别是数据源抓取逻辑

### Git Workflow
- 主分支: `main`
- 提交信息遵循约定式提交规范
- 使用 simple-git-hooks 和 lint-staged 进行代码质量检查
- 发布使用 bumpp 自动化版本管理

## Domain Context

### 新闻源管理
- 新闻源定义在 `shared/pre-sources.ts` 和 `shared/sources.json`
- 每个新闻源包含：名称、刷新间隔、颜色、标题、描述等元数据
- 支持子源 (sub sources) 和重定向机制
- 新闻源分为 "hottest" (热门) 和 "realtime" (实时) 两种类型

### 数据模型
- **NewsItem**: 新闻条目，包含标题、URL、发布时间、额外信息
- **Source**: 新闻源配置，包含爬取规则和元数据
- **Column**: 新闻栏目，组织不同的新闻源
- **SourceResponse**: API 响应格式，包含状态、更新时间和新闻列表

### MCP 集成
- 提供 MCP 服务器支持，允许 AI 助手访问新闻数据
- MCP 服务器配置在 `server/mcp/` 目录
- 支持通过 `npx newsnow-mcp-server` 启动

## Important Constraints

### 性能要求
- 抓取间隔最少 2 分钟，防止对目标网站造成压力
- 默认缓存 30 分钟，登录用户可强制刷新
- 支持多种部署环境的数据库配置

### 安全考虑
- 使用环境变量管理敏感信息 (GitHub OAuth, JWT 密钥等)
- 图片代理防止跨域问题
- 数据库连接安全性配置

### 兼容性要求
- 需要 Node.js >= 20
- 支持现代浏览器特性
- 适配 PWA (Progressive Web App)

## External Dependencies

### 核心依赖
- **爬虫相关**: cheerio, ofetch, fast-xml-parser, iconv-lite
- **数据处理**: dayjs, md5, zod
- **UI 交互**: @formkit/auto-animate, framer-motion, overlayscrollbars
- **认证**: jose (JWT 处理)

### 外部服务
- **GitHub OAuth**: 用户认证和数据同步
- **Cloudflare D1**: 推荐的数据库服务
- **各新闻网站**: 数据源 (微博、知乎、GitHub 等 40+ 新闻源)

### 部署平台
- **Cloudflare Pages**: 主要部署平台
- **Vercel**: 备选部署平台
- **Docker**: 本地和私有部署
