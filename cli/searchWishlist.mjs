import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const WISHLIST_FILE = join(__dirname, 'wishlist.json')

function searchByLabel(wishlist, label) {
  if (!label) {
    console.log('Please provide a label to search for.')
    return []
  }
  const lowerCaseLabel = label.toLowerCase()
  return wishlist.filter((item) => {
    const itemLabel = getLabelFromUrl(item.url)
    const artistName = item.artist?.name?.toLowerCase() || ''
    return (
      (itemLabel && itemLabel.toLowerCase().includes(lowerCaseLabel)) ||
      artistName.includes(lowerCaseLabel)
    )
  })
}

function getLabelFromUrl(url) {
  try {
    const hostname = new URL(url).hostname
    const match = hostname.match(/^(.*?)\.bandcamp\.com$/)
    if (match && match[1]) {
      return match[1]
    }
  } catch {
    // ignore invalid URLs
  }
  return null
}

try {
  const wishlistData = readFileSync(WISHLIST_FILE, 'utf8')
  const wishlist = JSON.parse(wishlistData)

  if (!Array.isArray(wishlist)) {
    console.error('Error: wishlist.json does not contain an array.')
    process.exit(1)
  }

  console.log(`Loaded ${wishlist.length} items from wishlist.`)

  const labelToSearch = process.argv[2]
  if (!labelToSearch) {
    console.log('Usage: node searchWishlist.mjs <label_to_search>')
    process.exit(0)
  }

  const results = searchByLabel(wishlist, labelToSearch)

  if (results.length > 0) {
    console.log(`\nFound ${results.length} items for "${labelToSearch}":`)
    results.forEach((item) => {
      console.log(`- ${item.name || item.title} by ${item.artist?.name || 'Unknown'} (${item.url})`)
    })
  } else {
    console.log(`\nNo items found for "${labelToSearch}".`)
  }
} catch (error) {
  console.error(`Error: ${error.message}`)
  process.exit(1)
}
