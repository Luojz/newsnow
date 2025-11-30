# NewsNow API 接口文档

## 概述

NewsNow 提供完整的 RESTful API 接口，支持新闻数据获取、用户认证、数据同步等功能。所有接口都遵循 REST 设计规范，返回 JSON 格式数据。

## 基础信息

- **Base URL**: `http:/43.143.225.199:8989/api`
- **Content-Type**: `application/json`
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证方式

### JWT Token 认证
用户登录后通过 JWT Token 进行身份认证：

```http
Authorization: Bearer <jwt_token>
```

### Cookie 认证
登录成功后，系统会设置相关 Cookie：
- `user_jwt`: JWT 认证令牌
- `user_avatar`: 用户头像
- `user_name`: 用户名称

## API 接口列表

### 1. 系统信息

#### 1.1 获取版本信息
```http
GET /api/latest
```

**响应示例:**
```json
{
  "v": "0.0.37"
}
```

---

### 2. 新闻数据接口

#### 2.1 获取单个新闻源数据
```http
GET /api/s?id=<source_id>&latest=<boolean>
```

**查询参数:**
- `id` (string, 必需): 新闻源 ID，例如 `weibo`, `zhihu`, `github`
- `latest` (boolean, 可选): 是否强制刷新数据，默认 `false`

**缓存策略:**
- 默认缓存时间：30 分钟 (TTL)
- 源刷新间隔：根据各源配置（默认 10 分钟，最少 2 分钟）
- 登录用户可通过 `latest=true` 强制刷新

**响应示例:**
```json
{
  "status": "success",
  "id": "weibo",
  "updatedTime": 1702924800000,
  "items": [
    {
      "id": "123456",
      "title": "新闻标题",
      "url": "https://example.com/news/123",
      "mobileUrl": "https://m.example.com/news/123",
      "pubDate": 1702921200000,
      "extra": {
        "hover": "悬停显示文本",
        "date": "2023-12-18",
        "info": "来源信息",
        "diff": 100,
        "icon": {
          "url": "https://example.com/icon.png",
          "scale": 1.2
        }
      }
    }
  ]
}
```

**状态说明:**
- `success`: 数据已更新
- `cache`: 使用缓存数据

#### 2.2 批量获取新闻源数据
```http
POST /api/s/entire
```

**请求体:**
```json
{
  "sources": ["weibo", "zhihu", "github"]
}
```

**响应示例:**
```json
[
  {
    "status": "cache",
    "id": "weibo",
    "items": [...],
    "updatedTime": 1702924800000
  },
  {
    "status": "success",
    "id": "zhihu",
    "items": [...],
    "updatedTime": 1702924800000
  }
]
```

---

### 3. 用户认证接口

#### 3.1 检查登录功能状态
```http
GET /api/enable-login
```

**响应示例:**
```json
{
  "enable": true,
  "url": "https://github.com/login/oauth/authorize?client_id=your_client_id"
}
```

#### 3.2 开始 GitHub 登录
```http
GET /api/login
```

**说明**: 重定向到 GitHub OAuth 授权页面

#### 3.3 GitHub OAuth 回调
```http
GET /api/oauth/github?code=<authorization_code>
```

**查询参数:**
- `code` (string, 必需): GitHub 授权码

**说明**: 处理 GitHub 回调，完成用户登录并重定向回主页

---

### 4. 用户数据接口

#### 4.1 获取用户信息
```http
GET /api/me
```

**认证**: 需要 JWT Token

**响应示例:**
```json
{
  "hello": "world"
}
```

#### 4.2 同步用户数据
```http
GET|POST /api/me/sync
```

**认证**: 需要 JWT Token

**GET 请求响应:**
```json
{
  "data": {
    "updatedTime": 1702924800000,
    "data": {
      "fixed": ["weibo", "zhihu"],
      "hidden": [],
      "custom": []
    }
  },
  "updatedTime": 1702924800000
}
```

**POST 请求体:**
```json
{
  "updatedTime": 1702924800000,
  "data": {
    "updatedTime": 1702924800000,
    "data": {
      "fixed": ["weibo", "zhihu"],
      "hidden": [],
      "custom": []
    },
    "action": "sync"
  }
}
```

**POST 请求响应:**
```json
{
  "success": true,
  "updatedTime": 1702924800000
}
```

---

### 5. 图片代理接口

#### 5.1 图片代理服务
```http
GET /api/proxy/img.png?url=<image_url>&type=<encode_type>
```

**查询参数:**
- `url` (string, 必需): 图片 URL，需要编码
- `type` (string, 可选): 编码类型，支持 `encodeURIComponent` 和 `decodeBase64URL`，默认 `encodeURIComponent`

**说明**: 解决跨域图片访问问题

---

### 6. MCP (Model Context Protocol) 接口

#### 6.1 MCP 服务器
```http
POST /api/mcp
```

**说明**: 提供 MCP 协议支持，允许 AI 助手访问新闻数据

**请求体**: JSON-RPC 2.0 格式
**响应体**: JSON-RPC 2.0 格式

---

## 数据类型定义

### NewsItem（新闻条目）
```typescript
interface NewsItem {
  id: string | number // 唯一标识
  title: string // 新闻标题
  url: string // 新闻链接
  mobileUrl?: string // 移动端链接
  pubDate?: number | string // 发布时间
  extra?: {
    hover?: string // 悬停文本
    date?: number | string // 格式化日期
    info?: false | string // 附加信息
    diff?: number // 时间差
    icon?: false | string | {
      url: string // 图标 URL
      scale: number // 缩放比例
    }
  }
}
```

### SourceResponse（新闻源响应）
```typescript
interface SourceResponse {
  status: "success" | "cache" // 数据状态
  id: SourceID // 新闻源 ID
  updatedTime: number | string // 更新时间
  items: NewsItem[] // 新闻列表
}
```

### PrimitiveMetadata（用户元数据）
```typescript
interface PrimitiveMetadata {
  updatedTime: number // 更新时间
  data: Record<FixedColumnID, SourceID[]> // 栏目数据
  action: "init" | "manual" | "sync" // 操作类型
}
```

---

## 错误处理

### HTTP 状态码
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `404`: 资源不存在
- `500`: 服务器内部错误

### 错误响应格式
```json
{
  "statusCode": 400,
  "message": "Invalid source id"
}
```

---

## 缓存策略

### 缓存层级
1. **浏览器缓存**: 默认 30 分钟
2. **服务端缓存**: 数据库存储，30 分钟 TTL
3. **源刷新间隔**: 各新闻源独立配置（2-60 分钟）

### 刷新策略
- **自动刷新**: 基于各源的 `interval` 配置
- **手动刷新**: 登录用户可通过 `latest=true` 强制刷新
- **批量刷新**: 支持 POST `/api/s/entire` 批量获取

---

## 使用限制

### 频率限制
- 单个新闻源最短刷新间隔：2 分钟
- 建议客户端刷新频率：每 10 分钟一次
- 批量请求限制：最多 50 个新闻源

### 数据限制
- 单次返回新闻条目：最多 30 条
- 新闻标题最大长度：200 字符
- URL 最大长度：2048 字符

---

## 部署环境变量

### 必需配置
```env
G_CLIENT_ID=your_github_client_id
G_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_jwt_secret
```

### 可选配置
```env
INIT_TABLE=true              # 是否初始化数据库表
ENABLE_CACHE=true            # 是否启用缓存
PRODUCTHUNT_API_TOKEN=token  # ProductHunt API Token
```

---

## 示例代码

### JavaScript/TypeScript 客户端示例

```typescript
// 获取新闻数据
async function fetchNews(sourceId: string, forceRefresh = false) {
  const url = `/api/s?id=${sourceId}&latest=${forceRefresh}`
  const response = await fetch(url)
  const data = await response.json()
  return data
}

// 用户登录
async function login() {
  window.location.href = "/api/login"
}

// 获取用户数据
async function getUserData() {
  const token = localStorage.getItem("user_jwt")
  const response = await fetch("/api/me/sync", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return await response.json()
}
```

### curl 命令示例

```bash
# 获取微博热搜
curl "https://your-domain.com/api/s?id=weibo"

# 强制刷新 GitHub Trending
curl "https://your-domain.com/api/s?id=github&latest=true"

# 批量获取多个源
curl -X POST "https://your-domain.com/api/s/entire" \
  -H "Content-Type: application/json" \
  -d '{"sources": ["weibo", "zhihu", "github"]}'

# 获取用户数据
curl "https://your-domain.com/api/me/sync" \
  -H "Authorization: Bearer your_jwt_token"
```

---

## 更新日志

### v0.0.37
- 新增 MCP 服务器支持
- 优化缓存策略
- 改进错误处理机制

### v0.0.36
- 支持批量获取新闻源
- 优化图片代理服务
- 增强用户数据同步功能

---

## 技术支持

如有问题或建议，请访问：
- GitHub Issues: https://github.com/ourongxing/newsnow/issues
- 项目主页: https://github.com/ourongxing/newsnow
