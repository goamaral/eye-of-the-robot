import path from 'node:path'
import { fileURLToPath } from 'node:url'

import newFastify from 'fastify'
import newFastifyStatic from "@fastify/static"
import scrape from 'website-scraper'
import fs from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fastify = newFastify({
  logger: true
})

fastify.register(newFastifyStatic, {
  root: path.join(__dirname, 'public'),
})

fastify.get('/', async (req, res) => {
  if (fs.existsSync(path.join(__dirname, 'public/scraped'))) {
    fs.rmdirSync(path.join(__dirname, 'public/scraped'), { recursive: true })
  }

  const result = await scrape({
    urls: ["https://webcache.googleusercontent.com/search?q=cache:https://medium.com/swlh/how-to-plan-your-days-and-weeks-effectively-a19d49d45dc3"],
    directory: path.join(__dirname, 'public/scraped'),
    request: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    },
    sources: [
      { selector: 'img', attr: 'src' },
      { selector: 'link[rel="stylesheet"]', attr: 'href' },
    ],
  })

  return res.sendFile("index.html")
})

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}