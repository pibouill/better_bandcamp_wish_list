<script>
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'

  let username = ''
  let cookie = ''
  let loading = false
  let error = ''
  let showCookieModal = false
  let needCookie = false
  let savedUsername = ''
  let savedCookie = ''

  onMount(() => {
    savedUsername = localStorage.getItem('bc_username') || ''
    savedCookie = localStorage.getItem('bc_cookie') || ''
    if (savedUsername) {
      username = savedUsername
      cookie = savedCookie
    }
  })

  async function handleSubmit() {
    if (!username.trim()) {
      error = 'Please enter a username'
      return
    }

    loading = true
    error = ''

    try {
      const params = new URLSearchParams({ username: username.trim() })
      if (cookie.trim()) {
        params.append('cookie', cookie.trim())
      }

      const res = await fetch(`/api/wishlist?${params}`)

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'private') {
          needCookie = true
          showCookieModal = true
          error = 'This wishlist is private. Add your cookie to continue.'
          loading = false
          return
        }
        throw new Error(data.error || data.message || 'Failed to fetch wishlist')
      }

      localStorage.setItem('bc_username', username.trim())
      if (cookie.trim()) {
        localStorage.setItem('bc_cookie', cookie.trim())
      }

      goto(`/dashboard?username=${encodeURIComponent(username.trim())}`)
    } catch (e) {
      error = e.message
    } finally {
      loading = false
    }
  }
</script>

<svelte:head>
  <title>Better Bandcamp Wishlist</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <div class="text-center mb-8">
      <div class="text-6xl mb-4">🎵</div>
      <h1 class="text-3xl font-bold text-white mb-2">Better Bandcamp Wishlist</h1>
      <p class="text-gray-400">View and explore any Bandcamp wishlist beautifully</p>
    </div>

    <div class="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300 mb-1">
            Bandcamp Username
          </label>
          <input
            id="username"
            type="text"
            bind:value={username}
            placeholder="Enter username (e.g., yourname)"
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {#if needCookie || cookie}
          <div>
            <label for="cookie" class="block text-sm font-medium text-gray-300 mb-1">
              Identity Cookie
              <button
                type="button"
                on:click={() => (showCookieModal = true)}
                class="text-amber-400 hover:text-amber-300 text-xs ml-2"
              >
                How to get?
              </button>
            </label>
            <input
              id="cookie"
              type="password"
              bind:value={cookie}
              placeholder="Paste your cookie to view private wishlist"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        {/if}

        {#if error}
          <div class="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        {/if}

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {#if loading}
            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Loading...</span>
          {:else}
            <span>View Wishlist</span>
          {/if}
        </button>
      </form>

      <div class="mt-6 pt-6 border-t border-gray-700">
        <button
          type="button"
          on:click={() => (showCookieModal = true)}
          class="w-full text-center text-gray-400 hover:text-gray-300 text-sm"
        >
          How do I view a private wishlist?
        </button>
      </div>
    </div>

    <p class="text-center text-gray-500 text-xs mt-6">
      Your credentials are stored locally in your browser. Never sent to any server.
    </p>

    <p class="text-center text-gray-500 text-xs mt-2">
      Powered by the Bandcamp API. Thanks to Bandcamp for making this possible.
    </p>

    <div class="flex justify-center gap-4 mt-4 text-sm">
      <a href="/privacy" class="text-gray-500 hover:text-gray-400">Privacy Policy</a>
      <a href="https://github.com/pibouill/better_bandcamp_wish_list" target="_blank" class="text-gray-500 hover:text-gray-400 flex items-center gap-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        GitHub
      </a>
    </div>
  </div>
</div>

{#if showCookieModal}
  <div 
    class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" 
    role="dialog" 
    aria-modal="true"
    aria-labelledby="cookie-modal-title"
    on:click|self={() => (showCookieModal = false)}
    on:keydown={(e) => e.key === 'Escape' && (showCookieModal = false)}
  >
    <div class="bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-white">How to get your Bandcamp cookie</h2>
          <button on:click={() => (showCookieModal = false)} class="text-gray-400 hover:text-white text-2xl">
            &times;
          </button>
        </div>

        <div class="text-gray-300 space-y-4 text-sm">
          <p>To view a private wishlist, you need to provide your Bandcamp authentication cookie.</p>

          <div class="bg-gray-900 rounded-lg p-4 space-y-3">
            <p><span class="text-amber-400 font-bold">Step 1:</span> Open <a href="https://bandcamp.com" target="_blank" class="text-amber-400 underline">bandcamp.com</a> in your browser and log in</p>
            
            <p><span class="text-amber-400 font-bold">Step 2:</span> Press <kbd class="bg-gray-700 px-2 py-1 rounded text-white">F12</kbd> to open Developer Tools</p>
            
            <p><span class="text-amber-400 font-bold">Step 3:</span> Click the <strong>Application</strong> tab (Chrome) or <strong>Storage</strong> tab (Firefox)</p>
            
            <p><span class="text-amber-400 font-bold">Step 4:</span> Expand <strong>Cookies</strong> → <strong>bandcamp.com</strong></p>
            
            <p><span class="text-amber-400 font-bold">Step 5:</span> Find and copy the value of the <code class="bg-gray-700 px-1 rounded">identity</code> cookie</p>
          </div>

          <div class="bg-amber-900/30 border border-amber-700 rounded-lg p-3">
            <p class="text-amber-200"><strong>Note:</strong> This cookie is stored only in your browser - it's never sent to any server except Bandcamp directly.</p>
          </div>

          <button
            on:click={() => (showCookieModal = false)}
            class="w-full bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold py-2 px-4 rounded-lg mt-4"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
