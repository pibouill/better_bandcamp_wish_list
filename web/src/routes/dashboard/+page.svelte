<script>
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'

  let username = ''
  let items = []
  let loading = true
  let error = ''
  let enhancing = false
  let enhancementProgress = ''
  let searchQuery = ''
  let releaseDateFilter = ''
  let filterType = 'all'
  let sortBy = 'date'
  let sortOrder = 'desc'
  let labelFilter = ''
  let genreFilter = ''
  let tagFilter = ''
  let addedDateSort = 'newest'
  let priceMin = ''
  let priceMax = ''
  let searchInTags = false
  let viewMode = 'grid'
  let showStats = false

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
    enhancementProgress = ''

    const cookie = localStorage.getItem('bc_cookie')
    try {
      const params = new URLSearchParams({ username })
      if (cookie) params.append('cookie', cookie)
      if (localStorage.getItem('bc_enhance') === 'true') params.append('enhance', 'true')

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

  async function reenhance() {
    if (!items.length || enhancing) return
    
    enhancing = true
    enhancementProgress = 'Enhancing...'
    
    const cookie = localStorage.getItem('bc_cookie')
    try {
      const params = new URLSearchParams({ username, enhance: 'true' })
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
      enhancing = false
      enhancementProgress = ''
    }
  }

  function normalizeForSearch(str) {
    if (!str) return ''
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  }

  function getLabelFromUrl(url) {
    if (!url) return ''
    try {
      const hostname = new URL(url).hostname
      const match = hostname.match(/^(.*?)\.bandcamp\.com$/)
      return match?.[1] || ''
    } catch {
      return ''
    }
  }

  $: filteredItems = items
    .filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false
      
      if (releaseDateFilter) {
        const itemYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : null
        if (!itemYear || itemYear.toString() !== releaseDateFilter) return false
      }

      if (labelFilter && item.label !== labelFilter) return false

      if (genreFilter && item.genre !== genreFilter) return false

      if (tagFilter) {
        const itemTags = item.tags || []
        if (!itemTags.some(t => t && t.toLowerCase().includes(tagFilter.toLowerCase()))) return false
      }

      if (priceMin || priceMax) {
        const price = parseFloat(item.price || item.minimumPrice || 0)
        if (priceMin && price < parseFloat(priceMin)) return false
        if (priceMax && price > parseFloat(priceMax)) return false
      }
      
      if (searchQuery) {
        const query = normalizeForSearch(searchQuery)
        const title = normalizeForSearch(item.title || item.name || '')
        const artistName = normalizeForSearch(item.artist?.name || '')
        const label = normalizeForSearch(item.label || getLabelFromUrl(item.url))
        const tags = searchInTags ? (item.tags || []).map(t => normalizeForSearch(t)).join(' ') : ''
        
        return title.includes(query) || 
               artistName.includes(query) ||
               label.includes(query) ||
               (searchInTags && tags.includes(query))
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'added') {
        if (addedDateSort === 'newest') {
          return (b.wishlistIndex || 0) - (a.wishlistIndex || 0)
        } else {
          return (a.wishlistIndex || 0) - (b.wishlistIndex || 0)
        }
      }
      
      let comparison = 0
      
      if (sortBy === 'artist') {
        comparison = (a.artist?.name || '').localeCompare(b.artist?.name || '')
      } else if (sortBy === 'title') {
        comparison = (a.title || a.name || '').localeCompare(b.title || b.name || '')
      } else if (sortBy === 'date') {
        const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : -1
        const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : -1
        comparison = dateA - dateB
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  $: sortLabel = sortBy === 'added'
    ? (addedDateSort === 'newest' ? 'Newest first' : 'Oldest first')
    : sortBy === 'date'
    ? (sortOrder === 'asc' ? 'Oldest' : 'Newest')
    : (sortOrder === 'asc' ? 'A → Z' : 'Z → A')

  function toggleSortOrder() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'
  }

  function clearFilters() {
    searchQuery = ''
    filterType = 'all'
    releaseDateFilter = ''
    labelFilter = ''
    genreFilter = ''
    tagFilter = ''
    priceMin = ''
    priceMax = ''
    sortBy = 'added'
    addedDateSort = 'newest'
    sortOrder = 'desc'
    searchInTags = false
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
    const headers = ['type', 'artist', 'title', 'label', 'genre', 'release_date', 'price', 'currency', 'url', 'image_url']
    const rows = filteredItems.map((item) => [
      item.type || 'unknown',
      item.artist?.name || '',
      item.title || item.name || '',
      item.label || getLabelFromUrl(item.url),
      item.genre || '',
      item.releaseDate || '',
      item.price || '',
      item.currency || '',
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

  $: availableYears = [...new Set(
    items
      .filter(item => item.releaseDate)
      .map(item => new Date(item.releaseDate).getFullYear())
      .filter(year => year > 0)
  )].sort((a, b) => b - a)

  $: availableLabels = [...new Set(
    items
      .filter(item => item.label)
      .map(item => item.label)
  )].sort()

  $: availableGenres = [...new Set(
    items
      .filter(item => item.genre)
      .map(item => item.genre)
  )].sort()

  $: availableTags = [...new Set(
    items
      .flatMap(item => item.tags || [])
  )].sort()

  $: allTagCounts = (() => {
    const counts = {}
    items.forEach(item => {
      (item.tags || []).forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
  })()
</script>

<svelte:head>
  <title>{username}'s Wishlist | Better Bandcamp Wishlist</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col font-body">
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-[1600px] mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
      <div class="flex items-center gap-2 sm:gap-3">
        <a href="/" class="text-xl sm:text-2xl">🎵</a>
        <div>
          <h1 class="text-base sm:text-xl font-bold text-gray-900 font-display truncate max-w-[150px] sm:max-w-none">{username}'s Wishlist</h1>
          <p class="text-xs sm:text-sm text-gray-500">
            {items.length} items{#if enhancementProgress} • {enhancementProgress}{/if}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        {#if localStorage.getItem('bc_cookie') && !enhancing}
          <button
            on:click={reenhance}
            class="text-xs sm:text-sm text-amber-600 hover:text-amber-700 px-3 py-2"
            title="Fetch more details (slower but more data)"
          >
            ✨ Enhance
          </button>
        {/if}
        <button on:click={logout} class="text-xs sm:text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
          Logout
        </button>
      </div>
    </div>
  </header>

  {#if loading}
    <div class="flex-1 flex flex-col items-center justify-center h-64 sm:h-96">
      <div class="animate-spin text-4xl mb-4">⏳</div>
      <p class="text-gray-500 font-body">Loading wishlist...</p>
    </div>
  {:else if error}
    <div class="flex-1 max-w-7xl mx-auto px-4 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-600 mb-4 font-body">{error}</p>
        <button on:click={() => goto('/')} class="text-amber-600 hover:text-amber-700 font-medium font-body">
          ← Try another username
        </button>
      </div>
    </div>
  {:else}
    <main class="flex-1 max-w-[1600px] mx-auto px-2 sm:px-4 py-4 sm:py-6 w-full">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div class="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
          <p class="text-xs text-gray-500 font-body">Total</p>
          <p class="text-xl sm:text-2xl font-bold text-gray-900 font-display">{stats.total}</p>
        </div>
        <div class="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
          <p class="text-xs text-gray-500 font-body">Albums</p>
          <p class="text-xl sm:text-2xl font-bold text-amber-600 font-display">{stats.albums}</p>
        </div>
        <div class="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
          <p class="text-xs text-gray-500 font-body">Tracks</p>
          <p class="text-xl sm:text-2xl font-bold text-blue-600 font-display">{stats.tracks}</p>
        </div>
        <div class="bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
          <p class="text-xs text-gray-500 font-body">Merch</p>
          <p class="text-xl sm:text-2xl font-bold text-purple-600 font-display">{stats.merch}</p>
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search by artist, title, label, tag..."
          class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-body text-sm"
        />
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" bind:checked={searchInTags} class="rounded text-amber-500 focus:ring-amber-500" />
            <span class="font-body">Search in tags</span>
          </label>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <select
            bind:value={filterType}
            class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-body text-sm bg-white"
          >
            <option value="all">All Types</option>
            <option value="album">Albums</option>
            <option value="track">Tracks</option>
            <option value="merch">Merch</option>
          </select>
          {#if availableYears.length > 0}
            <select
              bind:value={releaseDateFilter}
              class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-body text-sm bg-white"
            >
              <option value="">All Years</option>
              {#each availableYears as year}
                <option value={year.toString()}>{year}</option>
              {/each}
            </select>
          {/if}
          {#if availableLabels.length > 0}
            <select
              bind:value={labelFilter}
              class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-body text-sm bg-white"
            >
              <option value="">All Labels</option>
              {#each availableLabels as label}
                <option value={label}>{label}</option>
              {/each}
            </select>
          {/if}
          {#if availableGenres.length > 0}
            <select
              bind:value={genreFilter}
              class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-body text-sm bg-white"
            >
              <option value="">All Genres</option>
              {#each availableGenres as genre}
                <option value={genre}>{genre}</option>
              {/each}
            </select>
          {/if}
          {#if allTagCounts.length > 0}
            <select
              bind:value={tagFilter}
              class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-body text-sm bg-white"
            >
              <option value="">All Tags ({allTagCounts.length})</option>
              {#each allTagCounts as [tag, count]}
                <option value={tag}>{tag} ({count})</option>
              {/each}
            </select>
          {/if}
          <select
            bind:value={sortBy}
            class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-body text-sm bg-white"
          >
            <option value="added">Date Added</option>
            <option value="date">Release Date</option>
            <option value="artist">Artist</option>
            <option value="title">Title</option>
          </select>
          {#if sortBy === 'added'}
            <select
              bind:value={addedDateSort}
              class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-body text-sm bg-white"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          {:else if sortBy !== 'added'}
            <button
              on:click={toggleSortOrder}
              class="px-3 py-2 border rounded-lg font-body text-sm bg-white hover:bg-gray-50"
              title={sortOrder === 'asc' ? 'Sort Z → A' : 'Sort A → Z'}
            >
              {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
            </button>
          {/if}
          {#if items.some(i => i.price || i.minimumPrice)}
            <input
              type="number"
              bind:value={priceMin}
              placeholder="Min $"
              min="0"
              step="0.01"
              class="px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-body text-sm w-20"
            />
            <input
              type="number"
              bind:value={priceMax}
              placeholder="Max $"
              min="0"
              step="0.01"
              class="px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-body text-sm w-20"
            />
          {/if}
          <button
            on:click={clearFilters}
            class="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-body text-sm"
            title="Clear all filters"
          >
            Clear
          </button>
          <div class="flex gap-2 ml-auto">
            <button
              on:click={() => viewMode = 'grid'}
              class="px-3 py-2 border rounded-lg font-body text-sm {viewMode === 'grid' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}"
              title="Grid view"
            >
              ▦
            </button>
            <button
              on:click={() => viewMode = 'list'}
              class="px-3 py-2 border rounded-lg font-body text-sm {viewMode === 'list' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}"
              title="List view"
            >
              ☰
            </button>
            <button on:click={downloadJSON} class="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-xs sm:text-sm font-body whitespace-nowrap" title="Download as JSON">
              ↓ JSON
            </button>
            <button on:click={downloadCSV} class="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-xs sm:text-sm font-body whitespace-nowrap" title="Download as CSV">
              ↓ CSV
            </button>
          </div>
        </div>
      </div>

      {#if filteredItems.length === 0}
        <div class="text-center py-12 text-gray-500 font-body">No items match your search</div>
      {:else if viewMode === 'list'}
        <div class="space-y-2">
          {#each filteredItems as item}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 bg-white rounded-lg shadow-sm border hover:shadow-md transition-all p-2"
            >
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                {#if item.imageUrl}
                  <img src={item.imageUrl} alt={item.title || item.name} class="w-full h-full object-cover" loading="lazy" />
                {:else}
                  <div class="w-full h-full flex items-center justify-center text-lg">🎵</div>
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm sm:text-base font-medium text-gray-900 font-display truncate">{item.title || item.name}</p>
                <p class="text-xs sm:text-sm text-gray-500 font-body truncate">{item.artist?.name || 'Unknown'}</p>
                <div class="flex flex-wrap gap-1 mt-0.5">
                  {#if item.label}
                    <span class="text-[10px] text-amber-600 font-body">{item.label}</span>
                  {/if}
                  {#if item.genre}
                    <span class="text-[10px] text-blue-600 font-body">{item.genre}</span>
                  {/if}
                  {#if item.price}
                    <span class="text-[10px] text-green-600 font-body">{item.price} {item.currency}</span>
                  {/if}
                </div>
              </div>
              <div class="text-xs text-gray-400 font-body flex-shrink-0">#{item.wishlistIndex + 1}</div>
            </a>
          {/each}
        </div>
      {:else}
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5 sm:gap-2">
          {#each filteredItems as item}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              class="bg-white rounded-md sm:rounded-lg shadow-sm border hover:shadow-md transition-all overflow-hidden group block"
            >
              <div class="aspect-[3/4] bg-gray-100 relative">
                {#if item.imageUrl}
                  <img src={item.imageUrl} alt={item.title || item.name} class="w-full h-full object-cover" loading="lazy" />
                {:else}
                  <div class="w-full h-full flex items-center justify-center text-2xl">🎵</div>
                {/if}
                <div class="absolute top-1 right-1 bg-white/90 text-gray-900 text-[11px] sm:text-xs font-medium px-1.5 py-0.5 rounded shadow-sm font-display">{item.type}</div>
              </div>
              <div class="p-1.5 sm:p-2">
                <p class="text-[11px] sm:text-sm font-medium text-gray-900 font-display truncate">{item.title || item.name}</p>
                <p class="text-[10px] sm:text-xs text-gray-500 font-body truncate">{item.artist?.name || 'Unknown'}</p>
                <div class="flex flex-wrap gap-0.5 mt-0.5">
                  {#if item.label}
                    <p class="text-[9px] sm:text-xs text-amber-600 font-body truncate">{item.label}</p>
                  {:else}
                    <p class="text-[9px] sm:text-xs text-amber-600 font-body truncate">{getLabelFromUrl(item.url)}</p>
                  {/if}
                </div>
                {#if item.genre || item.price}
                  <div class="flex flex-wrap gap-0.5 mt-0.5">
                    {#if item.genre}
                      <span class="text-[9px] sm:text-xs text-blue-600 font-body">{item.genre}</span>
                    {/if}
                    {#if item.price}
                      <span class="text-[9px] sm:text-xs text-green-600 font-body">{item.price} {item.currency}</span>
                    {/if}
                  </div>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </main>
  {/if}

  <footer class="mt-auto py-4 sm:py-6 border-t">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 font-body">
      <p>Made by <a href="https://github.com/pibouill" target="_blank" class="text-amber-600 hover:underline">pibouill</a></p>
      <div class="flex gap-4">
        <a href="/privacy" class="hover:text-gray-700">Privacy</a>
        <a href="https://github.com/pibouill/better_bandcamp_wish_list" target="_blank" class="hover:text-gray-700 flex items-center gap-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </a>
      </div>
    </div>
  </footer>
</div>
