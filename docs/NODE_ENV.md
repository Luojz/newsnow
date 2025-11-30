# NewsNow NODE_ENV 环境变量说明

## 概述

`process.env.NODE_ENV === 'production'` 用于区分开发环境和生产环境，从而应用不同的CORS策略。

## 触发条件

### 1. 开发环境 (`npm run dev`)
```bash
npm run dev
# NODE_ENV = undefined 或 'development'
# CORS策略：允许所有域名 (*)
```

**特点：**
- NODE_ENV 通常为 `undefined` 或不设置
- CORS策略：`Access-Control-Allow-Origin: *`
- 允许任何域名跨域访问，便于开发测试

### 2. 生产环境构建
```bash
npm run build
# 构建时 NODE_ENV 可能会被某些工具设置为 'production'
```

### 3. 生产环境启动

#### 方式1：直接设置环境变量
```bash
NODE_ENV=production npm start
# NODE_ENV = 'production'
# CORS策略：根据 ALLOWED_ORIGINS 配置
```

#### 方式2：使用 .env 文件
在 `.env.server` 文件中添加：
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://example.com,https://app.example.com
```

#### 方式3：部署平台自动设置
大多数部署平台（Vercel、Netlify、Cloudflare Pages等）会自动设置 `NODE_ENV=production`

## 生产环境CORS策略

### 无 ALLOWED_ORIGINS 配置时
```bash
NODE_ENV=production npm start
# 默认允许所有域名
# Access-Control-Allow-Origin: *
```

### 有 ALLOWED_ORIGINS 配置时
```bash
NODE_ENV=production ALLOWED_ORIGINS="https://example.com,https://app.example.com" npm start
```

**CORS行为：**
- 允许的域名：`https://example.com`, `https://app.example.com`
- 不允许的域名：不会返回 `Access-Control-Allow-Origin` 头
- 响应头：`Access-Control-Allow-Origin: https://example.com` (动态返回请求的Origin)

## 部署平台的NODE_ENV设置

### Vercel
- 自动设置 `NODE_ENV=production`
- 通过环境变量配置 `ALLOWED_ORIGINS`

### Netlify
- 自动设置 `NODE_ENV=production`
- 通过环境变量配置 `ALLOWED_ORIGINS`

### Cloudflare Pages
- 自动设置 `NODE_ENV=production`
- 通过环境变量配置 `ALLOWED_ORIGINS`

### Docker
```dockerfile
# Dockerfile
ENV NODE_ENV=production
ENV ALLOWED_ORIGINS=https://yourdomain.com
```

### PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "newsnow",
    script: "dist/output/server/index.mjs",
    env: {
      NODE_ENV: "production",
      ALLOWED_ORIGINS: "https://yourdomain.com"
    }
  }]
}
```

## 环境变量优先级

1. 命令行设置 (最高优先级)
2. .env 文件
3. 系统环境变量
4. 默认值 (最低优先级)

## 调试和验证

### 检查当前NODE_ENV
```javascript
// 在API中添加日志
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("ALLOWED_ORIGINS:", process.env.ALLOWED_ORIGINS)
```

### 测试CORS配置
```bash
# 允许的域名
curl -H "Origin: https://example.com" http://localhost:3000/api/latest

# 不允许的域名
curl -H "Origin: https://evil.com" http://localhost:3000/api/latest
```

## 安全建议

### 生产环境推荐配置
```bash
# 严格限制域名
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 开发环境推荐配置
```bash
# 允许所有域名，便于开发
npm run dev
# 或
NODE_ENV=development npm start
```

## 常见问题

### Q: 为什么设置了NODE_ENV=production但CORS还是允许所有域名？
A: 可能原因：
1. ALLOWED_ORIGINS未设置或包含 "*"
2. 代码中的CORS插件优先级问题
3. 缓存问题，需要重启服务

### Q: 如何在不同环境使用不同配置？
A: 使用多个.env文件：
```bash
# .env.development
NODE_ENV=development

# .env.production
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

### Q: 本地开发如何模拟生产环境？
A:
```bash
NODE_ENV=production ALLOWED_ORIGINS="http://localhost:3000" npm start
```
