import bcfetch from 'bandcamp-fetch'

export async function GET({ url }) {
  const username = url.searchParams.get('username')?.trim()
  const cookie = url.searchParams.get('cookie')?.trim()

  if (!username) {
    return Response.json({ error: 'Username is required', message: 'Please enter a Bandcamp username' }, { status: 400 })
  }

  if (username.length > 100) {
    return Response.json({ error: 'Invalid username', message: 'Username is too long' }, { status: 400 })
  }

  try {
    if (cookie) {
      if (cookie.includes('identity=')) {
        bcfetch.setCookie(cookie)
      } else {
        bcfetch.setCookie(`identity=${cookie}; js_logged_in=1`)
      }
    }

    const fan = bcfetch.fan
    const allItems = []
    let target = username
    let pages = 0
    const maxPages = 500

    while (target && pages++ < maxPages) {
      try {
        const res = await fan.getWishlist({ target })

        if (!res || !res.items || res.items.length === 0) {
          break
        }

        allItems.push(...res.items)
        target = res.continuation || null

        if (!target) break

        await new Promise((r) => setTimeout(r, 150))
      } catch (pageError) {
        const pageMsg = pageError.message || ''
        if (pageMsg.includes('401') || pageMsg.includes('403')) {
          if (!cookie) {
            return Response.json({ error: 'private', message: 'This wishlist is private. Add your cookie to continue.' }, { status: 403 })
          }
          return Response.json({ error: 'invalid_cookie', message: 'The cookie appears to be invalid. Please get a fresh cookie from Bandcamp.' }, { status: 403 })
        }
        throw pageError
      }
    }

    if (allItems.length === 0) {
      if (!cookie) {
        return Response.json({ error: 'private', message: 'This wishlist is private. Add your cookie to continue.' }, { status: 403 })
      }
      return Response.json({ error: 'Empty wishlist', message: 'No items found. The wishlist may be empty or the cookie might be invalid.' }, { status: 404 })
    }

    const normalized = allItems.map(item => ({
      type: item.type,
      id: item.id,
      name: item.name || item.title,
      title: item.title,
      url: item.url,
      imageUrl: item.imageUrl || item.image || null,
      artist: item.artist,
      releaseDate: item.releaseDate || item.releasedDate || null
    }))

    return Response.json({ items: normalized, username })
  } catch (error) {
    const message = error.message || error.toString()
    const status = error.status || 500

    if (status === 401 || status === 403 || message.includes('401') || message.includes('403')) {
      return Response.json({ error: 'private', message: 'This wishlist is private. Add your cookie to continue.' }, { status: 403 })
    }

    if (message.includes('429') || status === 429) {
      return Response.json({ error: 'rate_limited', message: 'Too many requests. Please try again in a few minutes.' }, { status: 429 })
    }

    if (message.includes('fetch') || message.includes('network') || message.includes('ENOTFOUND')) {
      return Response.json({ error: 'network', message: 'Could not connect to Bandcamp. Please check your internet connection.' }, { status: 503 })
    }

    return Response.json({ error: 'Server error', message: 'Something went wrong. Please try again later.' }, { status: 500 })
  }
}
