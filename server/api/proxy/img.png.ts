export default defineEventHandler(async (event) => {
  const { url: img, type = "encodeURIComponent" } = getQuery(event)
  if (img) {
    const url = type === "encodeURIComponent" ? decodeURIComponent(img as string) : decodeBase64URL(img as string)
    return sendProxy(event, url)
  }
})
