import process from "node:process"

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("request", (event) => {
    // 只对API接口添加CORS头
    const url = getRequestURL(event)

    if (url.pathname.startsWith("/api")) {
      const origin = getHeader(event, "Origin")

      // 根据环境设置CORS策略
      if (process.env.NODE_ENV === "production") {
        // 生产环境：允许特定域名或所有域名
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["*"]
        const isAllowed = allowedOrigins.includes("*")
          || (origin && allowedOrigins.includes(origin))

        if (isAllowed) {
          setHeader(event, "Access-Control-Allow-Origin", origin || "*")
        }
      } else {
        // 开发环境：允许所有域名
        setHeader(event, "Access-Control-Allow-Origin", "*")
      }

      setHeader(event, "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
      setHeader(event, "Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control")
      setHeader(event, "Access-Control-Expose-Headers", "Content-Length, Content-Range")
      setHeader(event, "Access-Control-Allow-Credentials", "false")
      setHeader(event, "Access-Control-Max-Age", "86400")

      // 处理预检请求
      if (getMethod(event) === "OPTIONS") {
        setResponseStatus(event, 204)
        return "No Content"
      }
    }
  })
})
