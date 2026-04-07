<script>
  import '../../app.css'
</script>

<svelte:head>
  <title>Privacy Policy | Bandcamp Wishlist Viewer</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/" class="text-2xl">🎵</a>
        <a href="/" class="text-xl font-bold text-gray-900">Bandcamp Wishlist Viewer</a>
      </div>
    </div>
  </header>

  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-sm border p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      
      <div class="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Data We Collect</h2>
          <p class="text-gray-600">
            This application fetches publicly available wishlist data from Bandcamp. We do <strong>not</strong> collect, store, or process any personal information on our servers.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Local Storage</h2>
          <p class="text-gray-600">
            When you use the web app, the following may be stored locally in your browser:
          </p>
          <ul class="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li><strong>Bandcamp username</strong> - for convenience when returning to the app</li>
            <li><strong>Bandcamp cookie</strong> - only if you choose to save it, used to access private wishlists</li>
          </ul>
          <p class="text-gray-600 mt-2">
            This data stays in your browser and is never sent to our servers.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Third-Party Data</h2>
          <p class="text-gray-600">
            The app communicates directly with Bandcamp's servers to fetch wishlist data. Your IP address and request data may be visible to Bandcamp as if you were browsing their website normally.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Cookies & Authentication</h2>
          <p class="text-gray-600">
            If you choose to enter your Bandcamp cookie to view private wishlists, note that:
          </p>
          <ul class="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>The cookie is stored only in your browser's localStorage</li>
            <li>It is used only to authenticate requests to Bandcamp</li>
            <li>It is never transmitted to any server other than Bandcamp</li>
            <li>You can delete it at any time by clicking "Logout"</li>
          </ul>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Your Rights (GDPR)</h2>
          <p class="text-gray-600">
            Since we don't store personal data on our servers, there's no data to delete or export. Any data stored in your browser can be cleared by:
          </p>
          <ul class="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>Clearing your browser's localStorage</li>
            <li>Clicking "Logout" in the app (clears username and cookie)</li>
            <li>Clearing cookies for this site in your browser settings</li>
          </ul>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Contact</h2>
          <p class="text-gray-600">
            If you have questions about this privacy policy, please open an issue on <a href="https://github.com/pibouill/better_bandcamp_wishlist" target="_blank" rel="noopener" class="text-amber-600 hover:underline">GitHub</a>.
          </p>
        </section>

        <section class="pt-4 border-t text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </section>
      </div>
    </div>
  </div>

  <footer class="mt-auto py-6 border-t">
    <div class="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
      <p>Made by <a href="https://github.com/pibouill" target="_blank" class="text-amber-600 hover:underline">pibouill</a></p>
      <div class="flex gap-4">
        <a href="https://github.com/pibouill/better_bandcamp_wishlist" target="_blank" class="hover:text-gray-700 flex items-center gap-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          GitHub
        </a>
      </div>
    </div>
  </footer>
</div>
