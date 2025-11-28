const path = require("node:path")
const fs = require("node:fs")
const Database = require("better-sqlite3")

const dbPath = path.join(__dirname, "../.data/db.sqlite3")

try {
  const db = new Database(dbPath)
  console.log("🗄️ 数据库文件:", dbPath)
  console.log("📊 数据库大小:", (fs.statSync(dbPath).size / 1024).toFixed(2), "KB")

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type=\"table\"").all()
  console.log("\n📋 数据库表:", tables)

  const records = db.prepare("SELECT id, LENGTH(data) as data_length, updated FROM cache").all()
  console.log("\n📝 缓存记录:")
  console.log("总共", records.length, "个新闻源")

  records.forEach((record) => {
    console.log("\n🔹", `${record.id}:`)
    console.log("   更新时间:", new Date(record.updated).toLocaleString())
    console.log("   数据长度:", record.data_length, "字符")

    const fullData = db.prepare("SELECT data FROM cache WHERE id = ?").get(record.id)
    try {
      const parsedData = JSON.parse(fullData.data)
      console.log("   新闻条数:", parsedData.length)

      if (parsedData.length > 0) {
        const firstItem = parsedData[0]
        console.log("   第一条新闻示例:")
        console.log("     标题:", firstItem.title)
        console.log("     URL:", firstItem.url)
        if (firstItem.pubDate) {
          console.log("     发布时间:", new Date(firstItem.pubDate).toLocaleString())
        }
        if (firstItem.extra) {
          console.log("     附加信息:", JSON.stringify(firstItem.extra, null, 2))
        }
      }
    } catch (e) {
      console.log("   ❌ 解析失败:", e.message)
    }
  })

  db.close()
  console.log("\n✅ 数据库检查完成")
} catch (error) {
  console.error("❌ 检查失败:", error.message)
}
