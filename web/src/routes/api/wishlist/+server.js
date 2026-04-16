import { BandcampFetch, AlbumAPI } from 'bandcamp-fetch'

const albumApi = new AlbumAPI({ imageFormat: 'art_app_large' })

const ENRICHABLE_TYPES = ['album', 'track']

async function enrichItem(item) {
  if (!item.url || !ENRICHABLE_TYPES.includes(item.type)) {
    return item
  }

  try {
    const full = await albumApi.getInfo({ albumUrl: item.url })
    return {
      ...item,
      genre: full.genre || item.genre || null,
      releaseDate: full.releaseDate || item.releaseDate || null,
      tags: full.tags || item.tags || [],
      description: full.description || null,
      keywords: full.keywords || [],
      location: full.location || null
    }
  } catch {
    return item
  }
}

export async function GET({ url }) {
  const username = url.searchParams.get('username')?.trim()
  const cookie = url.searchParams.get('cookie')?.trim()
  const enhance = url.searchParams.get('enhance') === 'true'

  if (!username) {
    return Response.json(
      { error: 'Username is required', message: 'Please enter a Bandcamp username' },
      { status: 400 }
    )
  }

  if (username.length > 100) {
    return Response.json(
      { error: 'Invalid username', message: 'Username is too long' },
      { status: 400 }
    )
  }

  if (enhance && !cookie) {
    return Response.json(
      { error: 'Cookie required', message: 'Adding your cookie is required for enhanced mode.' },
      { status: 400 }
    )
  }

  if (enhance && cookie && cookie.length < 10) {
    return Response.json(
      {
        error: 'Invalid cookie',
        message: 'Cookie value seems too short. Please get a fresh cookie.'
      },
      { status: 400 }
    )
  }

  try {
    let cookieValue = null

    if (cookie && cookie.length >= 10) {
      cookieValue = cookie.includes('identity=') ? cookie : `identity=${cookie}; js_logged_in=1`
    }

    const bcfetchInstance = cookieValue
      ? new BandcampFetch({ cookie: cookieValue })
      : new BandcampFetch()

    const fan = bcfetchInstance.fan
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

        await new Promise((r) => setTimeout(r, cookieValue ? 200 : 500))
      } catch (pageError) {
        const pageMsg = pageError.message || ''
        if (pageMsg.includes('401') || pageMsg.includes('403')) {
          if (!cookie) {
            return Response.json(
              {
                error: 'private',
                message: 'This wishlist is private. Add your cookie to continue.'
              },
              { status: 403 }
            )
          }
          return Response.json(
            {
              error: 'invalid_cookie',
              message: 'The cookie appears to be invalid. Please get a fresh cookie from Bandcamp.'
            },
            { status: 403 }
          )
        }
        throw pageError
      }
    }

    if (allItems.length === 0) {
      if (!cookie) {
        return Response.json(
          { error: 'private', message: 'This wishlist is private. Add your cookie to continue.' },
          { status: 403 }
        )
      }
      return Response.json(
        {
          error: 'Empty wishlist',
          message: 'No items found. The wishlist may be empty or the cookie might be invalid.'
        },
        { status: 404 }
      )
    }

    let normalized = allItems.map((item, index) => ({
      type: item.type,
      id: item.id,
      name: item.name || item.title,
      title: item.title,
      url: item.url,
      imageUrl: item.imageUrl || item.image || null,
      artist: item.artist,
      releaseDate: item.releaseDate || item.releasedDate || null,
      label: item.label?.name || null,
      labelUrl: item.label?.url || null,
      genre: item.genre || null,
      tags: item.tags || [],
      price: item.price || null,
      minimumPrice: item.minimumPrice || null,
      currency: item.currency || null,
      trackCount: item.trackCount || null,
      itemType: item.itemType || null,
      wishlistIndex: index
    }))

    if (enhance && cookieValue) {
      const batchSize = 5
      const enrichedMap = new Map()

      const totalTimeout = 20 * 1000
      const startTime = Date.now()

      for (let i = 0; i < normalized.length; i += batchSize) {
        if (Date.now() - startTime > totalTimeout) {
          break
        }

        const batch = normalized.slice(i, i + batchSize)
        const results = await Promise.all(
          batch.map((item) =>
            Promise.race([
              enrichItem(item),
              new Promise((resolve) => setTimeout(() => resolve(item), 3000))
            ])
          )
        )
        results.forEach((item) => {
          if (item && item.id) enrichedMap.set(item.id, item)
        })
      }

      if (enrichedMap.size > 0) {
        normalized = normalized.map((item) => enrichedMap.get(item.id) || item)
      }
    }

    return Response.json({ items: normalized, username })
  } catch (error) {
    const message = error.message || error.toString()
    const status = error.status || 500

    if (status === 401 || status === 403 || message.includes('401') || message.includes('403')) {
      return Response.json(
        { error: 'private', message: 'This wishlist is private. Add your cookie to continue.' },
        { status: 403 }
      )
    }

    if (message.includes('429') || status === 429) {
      return Response.json(
        { error: 'rate_limited', message: 'Too many requests. Please try again in a few minutes.' },
        { status: 429 }
      )
    }

    if (message.includes('fetch') || message.includes('network') || message.includes('ENOTFOUND')) {
      return Response.json(
        {
          error: 'network',
          message: 'Could not connect to Bandcamp. Please check your internet connection.'
        },
        { status: 503 }
      )
    }

    return Response.json(
      { error: 'Server error', message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
