<script>
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'

  let username = ''
  let items = []
  let loading = true
  let error = ''
  let searchQuery = ''
  let filterType = 'all'
  let sortBy = 'date'

  $: username = $page.url.searchParams.get('username') || ''

  onMount(() => {
    if (!username) {
      goto('/')
      return
    }
    fetchWishlist()
  })

  async function fetchWishlist() {
    loading = true
    error = ''

    const cookie = localStorage.getItem('bc_cookie')
    try {
      const params = new URLSearchParams({ username })
      if (cookie) params.append('cookie', cookie)

      const res = await fetch(`/api/wishlist?${params}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || data.error)
      }

      items = data.items || []
    } catch (e) {
      error = e.message
    } finally {
      loading = false
    }
  }

  $: filteredItems = items
    .filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const artist = item.artist?.name?.toLowerCase() || ''
        const title = (item.title || item.name || '').toLowerCase()
        const label = getLabelFromUrl(item.url)
        return artist.includes(query) || title.includes(query) || label.includes(query)
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'artist') {
        return (a.artist?.name || '').localeCompare(b.artist?.name || '')
      }
      return 0
    })

  function getLabelFromUrl(url) {
    try {
      const hostname = new URL(url).hostname
      const match = hostname.match(/^(.*?)\.bandcamp\.com$/)
      return match?.[1] || ''
    } catch {
      return ''
    }
  }

  function downloadJSON() {
    const data = JSON.stringify(filteredItems, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${username}-wishlist.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadCSV() {
    const headers = ['type', 'artist', 'title', 'url', 'image_url']
    const rows = filteredItems.map((item) => [
      item.type || 'unknown',
      item.artist?.name || '',
      item.title || item.name || '',
      item.url || '',
      item.imageUrl || ''
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${username}-wishlist.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function logout() {
    localStorage.removeItem('bc_username')
    localStorage.removeItem('bc_cookie')
    goto('/')
  }

  $: stats = {
    total: items.length,
    albums: items.filter((i) => i.type === 'album').length,
    tracks: items.filter((i) => i.type === 'track').length,
    merch: items.filter((i) => i.type === 'merch').length
  }
</script>

<svelte:head>
  <title>{username}'s Wishlist | Better Bandcamp Wishlist</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/" class="text-2xl">🎵</a>
        <div>
          <h1 class="text-xl font-bold text-gray-900">{username}'s Wishlist</h1>
          <p class="text-sm text-gray-500">{items.length} items</p>
        </div>
      </div>
      <button on:click={logout} class="text-sm text-gray-500 hover:text-gray-700">
        Logout
      </button>
    </div>
  </header>

  {#if loading}
    <div class="flex-1 flex items-center justify-center h-96">
      <div class="text-center">
        <div class="animate-spin text-4xl mb-4">⏳</div>
        <p class="text-gray-500">Loading wishlist...</p>
      </div>
    </div>
  {:else if error}
    <div class="flex-1 max-w-7xl mx-auto px-4 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-600 mb-4">{error}</p>
        <button on:click={() => goto('/')} class="text-amber-600 hover:text-amber-700 font-medium">
          ← Try another username
        </button>
      </div>
    </div>
  {:else}
    <main class="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 shadow-sm border">
          <p class="text-sm text-gray-500">Total Items</p>
          <p class="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm border">
          <p class="text-sm text-gray-500">Albums</p>
          <p class="text-2xl font-bold text-amber-600">{stats.albums}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm border">
          <p class="text-sm text-gray-500">Tracks</p>
          <p class="text-2xl font-bold text-blue-600">{stats.tracks}</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search by artist, title, or label..."
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <select
          bind:value={filterType}
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Types</option>
          <option value="album">Albums</option>
          <option value="track">Tracks</option>
          <option value="merch">Merch</option>
        </select>
        <select
          bind:value={sortBy}
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="date">Sort by Date</option>
          <option value="price">Sort by Price</option>
          <option value="artist">Sort by Artist</option>
        </select>
        <div class="flex gap-2">
          <button on:click={downloadJSON} class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
            JSON
          </button>
          <button on:click={downloadCSV} class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
            CSV
          </button>
        </div>
      </div>

      {#if filteredItems.length === 0}
        <div class="text-center py-12 text-gray-500">No items match your search</div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {#each filteredItems as item}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden group block"
            >
              <div class="aspect-square bg-gray-100 relative">
                {#if item.imageUrl}
                  <img src={item.imageUrl} alt={item.title || item.name} class="w-full h-full object-cover" loading="lazy" />
                {:else}
                  <div class="w-full h-full flex items-center justify-center text-4xl">🎵</div>
                {/if}
                <div class="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{item.type}</div>
              </div>
              <div class="p-3">
                <p class="font-medium text-gray-900 truncate">{item.title || item.name}</p>
                <p class="text-sm text-gray-500 truncate">{item.artist?.name || 'Unknown Artist'}</p>
                <p class="text-xs text-gray-400 mt-1">{getLabelFromUrl(item.url)}</p>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </main>
  {/if}

  <footer class="mt-auto py-6 border-t">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
      <p>Made by <a href="https://github.com/pibouill" target="_blank" class="text-amber-600 hover:underline">pibouill</a></p>
      <div class="flex gap-4">
        <a href="/privacy" class="hover:text-gray-700">Privacy Policy</a>
        <a href="https://github.com/pibouill/better_bandcamp_wish_list" target="_blank" class="hover:text-gray-700 flex items-center gap-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </a>
      </div>
    </div>
  </footer>
</div>
