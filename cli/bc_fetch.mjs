// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   bc_fetch.js                                        :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: pibouill <pibouill@student.42prague.com>   +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2026/01/09 19:07:25 by pibouill          #+#    #+#             //
//   Updated: 2026/01/09 19:07:27 by pibouill         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import bcfetch from 'bandcamp-fetch'
import { writeFileSync, existsSync, readFileSync, renameSync, unlinkSync } from 'fs'
import { config } from 'dotenv'

config()
const username = process.argv[2] || process.env.BANDCAMP_USERNAME

if (!username) {
  console.error('❌ No username provided')
  console.error('  Usage: node bc_fetch.mjs <username>')
  console.error('  Or set BANDCAMP_USERNAME in .env file')
  process.exit(1)
}

const timestamp = () => new Date().toISOString().split('T')[1].slice(0, 8)

function drawProgressBar(current, page) {
  return `📦 ${current.toLocaleString()} items • 📄 ${page} pages`
}

function separator() {
  console.log('─'.repeat(42))
}

function section(title) {
  console.log('')
  console.log(`📁 ${title}`)
  separator()
}

function result(label, value) {
  const line = value ? `${label}  →  ${value}` : label
  console.log(`  ${line}`)
}

function error(msg) {
  console.error(`\n❌ ${msg}\n`)
}

function warn(msg) {
  console.log(`  ⚠️  ${msg}`)
}

async function backup() {
  const startTime = Date.now()
  const fan = bcfetch.fan

  const identityCookie = process.env.BANDCAMP_IDENTITY_COOKIE
  const jsLoggedInCookie = process.env.BANDCAMP_JS_LOGGED_IN_COOKIE || '1'

  if (!identityCookie) {
    error('BANDCAMP_IDENTITY_COOKIE not set in .env file')
    console.error('  Please get your Bandcamp identity cookie and add it to .env')
    process.exit(1)
  }

  bcfetch.setCookie(`identity=${identityCookie}; js_logged_in=${jsLoggedInCookie}`)

  // banner(username);
  section('Fetching wishlist')

  console.log(`  ${timestamp()} Starting fetch...\n`)

  let target = username
  const allItems = []
  let pages = 0
  const maxPages = 100
  let fetchError = null

  while (target && pages++ < maxPages) {
    try {
      const res = await fan.getWishlist({ target })

      if (!res || !res.items) {
        warn('No items found on this page')
        break
      }

      if (res.items.length) {
        allItems.push(...res.items)
        console.log(`  ${drawProgressBar(allItems.length, pages)}`)
      }

      target = res.continuation || null

      if (!target) break

      await new Promise((r) => setTimeout(r, 150))
    } catch (e) {
      fetchError = e
      if (e.message?.includes('429') || e.status === 429) {
        error('Rate limited by Bandcamp (429)')
        warn('Try running again in a few minutes')
      } else if (e.message?.includes('401') || e.status === 401) {
        error('Authentication failed - cookie may be expired')
      } else if (e.message?.includes('403') || e.status === 403) {
        error('Access forbidden - check your cookie')
      } else {
        error(`Network error: ${e.message}`)
      }
      break
    }
  }

  if (fetchError && allItems.length === 0) {
    error('Failed to fetch any items')
    process.exit(1)
  }

  if (fetchError && allItems.length > 0) {
    warn(`Partial results: ${allItems.length} items before error`)
  }

  if (allItems.length === 0) {
    error('No items found - check username and cookie')
    process.exit(1)
  }

  section('Change detection')

  let changes = { added: 0, removed: 0, totalNew: allItems.length }

  if (existsSync('wishlist.json')) {
    try {
      const oldItems = JSON.parse(readFileSync('wishlist.json', 'utf8'))

      if (!Array.isArray(oldItems)) {
        warn('Previous backup corrupted, treating as new')
      } else {
        const oldUrls = new Set(oldItems.map((item) => item.url).filter(Boolean))
        const newUrls = new Set(allItems.map((item) => item.url).filter(Boolean))

        for (const url of newUrls) if (!oldUrls.has(url)) changes.added++
        for (const url of oldUrls) if (!newUrls.has(url)) changes.removed++

        result('Added', `+${changes.added}`)
        result('Removed', `-${changes.removed}`)
        result('Total now', allItems.length)
        result('Was', oldItems.length)
        result(
          'Net change',
          `${allItems.length - oldItems.length > 0 ? '+' : ''}${allItems.length - oldItems.length}`
        )
      }
    } catch (e) {
      warn(`Could not read previous backup: ${e.message}`)
      result('New backup', `${allItems.length} items`)
    }
  } else {
    result('New backup', `${allItems.length} items`)
  }

  // Atomic write - write to temp first, then rename
  const tmpJson = 'wishlist.json.tmp'
  const tmpCsv = 'wishlist.csv.tmp'

  try {
    writeFileSync(tmpJson, JSON.stringify(allItems, null, 2))

    const headers = [
      'type',
      'artist',
      'title',
      'url',
      'current_price',
      'original_price',
      'release_date'
    ]
    const csvRows = allItems.map((item) =>
      [
        `"${item.type || 'unknown'}"`,
        `"${(item.artist?.name || '').replace(/"/g, '""')}"`,
        `"${(item.type === 'track' ? item.name : item.title || '').replace(/"/g, '""')}"`,
        `"${item.url || ''}"`,
        `"${item.current?.price || ''}"`,
        `"${item.original?.price || ''}"`,
        `"${item.releaseDate || ''}"`
      ].join(',')
    )

    writeFileSync(tmpCsv, [headers.join(','), ...csvRows].join('\n'))

    // Atomic rename
    renameSync(tmpJson, 'wishlist.json')
    renameSync(tmpCsv, 'wishlist.csv')
  } catch (e) {
    error(`Failed to save files: ${e.message}`)
    // Clean up temp files
    try {
      unlinkSync(tmpJson)
      unlinkSync(tmpCsv)
    } catch {}
    process.exit(1)
  }

  section('Summary')
  result('Items fetched', allItems.length)
  result('Runtime', `${((Date.now() - startTime) / 1000).toFixed(1)}s`)
  result('Saved', 'wishlist.json, wishlist.csv')

  console.log('\n✅ Backup complete!\n')
}

backup().catch(console.error)
