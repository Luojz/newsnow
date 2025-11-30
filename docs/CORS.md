# NewsNow API CORS 配置指南

## 概述

NewsNow API 现已支持跨域访问（CORS），允许来自不同域名的应用程序访问所有API接口。

## 配置方式

### 1. 全局CORS配置

通过 `nitro.config.ts` 中的 `routeRules` 配置，所有 `/api/**` 路径的接口都会自动添加CORS头：

```typescript
// nitro.config.ts
const nitroOption = {
  routeRules: {
    "/api/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control",
        "Access-Control-Expose-Headers": "Content-Length, Content-Range",
        "Access-Control-Max-Age": "86400",
      },
    },
  },
}
```

### 2. 自定义CORS插件

还提供了更灵活的CORS插件 (`server/plugins/cors.ts`)，支持：

- 开发环境：允许所有域名访问
- 生产环境：可通过环境变量 `ALLOWED_ORIGINS` 限制访问域名

## 环境变量

### ALLOWED_ORIGINS

在生产环境中，可以通过此环境变量指定允许访问的域名列表：

```bash
# 允许特定域名
ALLOWED_ORIGINS=https://example.com,https://app.example.com

# 允许所有域名（默认）
ALLOWED_ORIGINS=*
```

## 支持的HTTP方法

所有API接口支持以下HTTP方法：
- GET
- POST
- PUT
- DELETE
- OPTIONS
- PATCH

## 支持的请求头

客户端可以发送以下请求头：
- Content-Type
- Authorization
- X-Requested-With
- Accept
- Origin
- Cache-Control

## 预检请求

系统自动处理OPTIONS预检请求，返回204状态码。

## 使用示例

### JavaScript/Fetch

```javascript
// 获取新闻数据
fetch("http://43.143.225.199:8989/api/s?id=weibo", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
```

### cURL 命令

```bash
# 带Origin头的请求
curl -H "Origin: https://example.com" \
     http://43.143.225.199:8989/api/latest

# 预检请求
curl -X OPTIONS \
     -H "Origin: https://example.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     http://43.143.225.199:8989/api/s/entire
```

## 注意事项

1. **安全考虑**：在生产环境中建议限制允许访问的域名
2. **缓存**：CORS预检请求缓存时间为86400秒（24小时）
3. **认证**：需要认证的接口仍需要提供有效的JWT Token
4. **错误处理**：跨域错误通常会在浏览器控制台中显示

## 验证CORS配置

可以通过以下方式验证CORS是否正确配置：

1. 检查响应头是否包含 `Access-Control-Allow-Origin`
2. 进行跨域请求测试
3. 检查浏览器开发者工具的网络面板

## 更新日志

### v0.0.38
- 新增全局CORS支持
- 添加环境变量配置选项
- 优化预检请求处理
- 更新图片代理接口的CORS配置
