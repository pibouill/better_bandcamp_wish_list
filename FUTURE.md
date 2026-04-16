# Future Improvements

This document outlines planned and potential improvements for Better Bandcamp Wishlist.

---

## Planned Features

### Genre Search

**Status:** Not started

Bandcamp releases have genre tags, but the wishlist API doesn't return them. Potential solutions:

1. **Search API integration** - Search Bandcamp's discovery API for genres and match against wishlist items
2. **Album page scraping** - For each wishlist item, fetch full album data to get tags (would require many extra API calls)
3. **User-contributed tags** - Allow users to add their own tags to items

**Priority:** Medium

---

### Additional Features

- [ ] **Change history** - Track when items were added/removed from wishlists
- [ ] **Wishlist comparison** - Compare two users' wishlists to find common interests
- [ ] **Price alerts** - Notify when wishlist items go on sale
- [ ] **Dark mode toggle** - Allow users to switch between light/dark themes
- [ ] **Bulk actions** - Select multiple items to export or remove from wishlist
- [ ] **Share wishlist** - Generate a shareable link to someone's public wishlist
- [ ] **PWA support** - Installable as a native app on mobile/desktop

---

### Technical Improvements

- [ ] **Caching** - Cache wishlist results briefly (5 min TTL) to reduce API calls
- [ ] **Rate limiting** - Add per-user rate limiting to prevent 429 errors
- [ ] **Offline support** - Service worker for offline viewing of cached wishlists
- [ ] **Unit tests** - Add test coverage for core functionality

---

## Known Limitations

- **Price data** - Bandcamp's wishlist API doesn't return current/original prices
- **Release date** - Not always available in wishlist data
- **Genre tags** - Not available via wishlist API (see Genre Search above)

---

## Contributing

Want to help implement these features? Check out the [GitHub repository](https://github.com/pibouill/better_bandcamp_wish_list) and open an issue!
