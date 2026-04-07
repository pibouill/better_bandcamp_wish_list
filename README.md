# Bandcamp Wishlist Viewer

A web app and CLI tool to view, backup, and manage Bandcamp wishlists.

(big WIP :) )

## Features

- View any Bandcamp wishlist (public or private)
- Web interface for browsing, searching, and filtering
- CLI tool for local backups
- Track changes between backups (additions/removals)
- Export data to both JSON and CSV formats
- Search your wishlist by record label
- Schedule automatic daily backups using cron

## How Bandcamp Wishlists Work

### Public vs Private Wishlists

Bandcamp users can set their wishlist visibility:

| Setting     | Can View?  | How to Access           |
| ----------- | ---------- | ----------------------- |
| **Public**  | Anyone     | Just enter the username |
| **Private** | Owner only | Requires your cookie    |

**Recent Change (2024+):** Bandcamp now shows wishlists as **public by default** for most users. However, some older accounts or users who explicitly set their wishlist to private will still require authentication.

### How It Works (Technical)

1. **Public wishlists:** The app makes requests to Bandcamp's internal API without any authentication. If the wishlist is public, it returns all items.

2. **Private wishlists:** If the API returns a 401/403 error, the app asks the user to provide their Bandcamp cookie (stored only in their browser - never sent to any server except Bandcamp).

3. **Cookie-based fetching:** With a valid cookie, the app can access private wishlists by passing the `identity` cookie in the request headers.

### Update Frequency

**How long does it take for changes to appear?**

- **Immediately:** Changes to your own wishlist (adding/removing items) appear in real-time when you refresh.
- **API updates:** The app fetches fresh data each time - there's no cache, so you're always seeing the current state.

**How often can you fetch?**

- Bandcamp has rate limiting. The app includes a 200ms delay between requests to avoid getting blocked.
- If you get rate-limited (429 error), wait a few minutes before trying again.

### Why Does This Matter?

- **Privacy changes:** If someone's wishlist went from private to public recently, you can now view it without needing their cookie.
- **Real-time access:** Unlike some services that cache data, this tool fetches live data each time.

## Quick Start (Web App)

### 1. Visit the Web App

Simply go to the deployed URL (e.g., `your-app.netlify.app`) and enter any Bandcamp username.

### 2. For Private Wishlists

If a wishlist is private, you'll be prompted to add your Bandcamp cookie. See the [Cookie Tutorial](#bandcamp-authentication) below.

---

## CLI Tool (Local Backup)

The CLI tool is in the `/cli` folder for local backups.

### 1. Install dependencies

```bash
cd cli && npm install
```

### 2. Configure your settings

Copy the sample configuration and edit it:

```bash
cp .env.sample .env
```

Edit `.env` with your Bandcamp username and authentication cookie.

### 3. Run a manual backup

```bash
node bc_fetch.mjs your_username
```

### 4. (Optional) Set up automatic backups

Edit your crontab:

```bash
crontab -e
```

Add this line to run daily at 2 AM:

```bash
0 2 * * * /bin/bash /full/path/to/cli/run_bc_fetch.sh
```

Make the script executable:

```bash
chmod +x cli/run_bc_fetch.sh
```

## Searching Your Wishlist (CLI)

Find all items from a specific label:

```bash
cd cli && node searchWishlist.mjs label_name
```

## Output Files

- `cli/wishlist.json` - Complete backup in JSON format
- `cli/wishlist.csv` - Backup in CSV format (easy to import into spreadsheets)
- `cli/bc_fetch.log` - Log of backup operations

## Requirements

- Node.js (v18 or later)
- npm (comes with Node.js)
- Cron (for automatic backups on Linux/macOS)

## Important Notes

### Bandcamp API & How It Works

This tool uses Bandcamp's internal API (via the `bandcamp-fetch` library) to fetch wishlist data. Here's what you need to know:

**Public Wishlists:**

- Most Bandcamp wishlists are now **public by default**
- Just enter the username - no authentication needed
- Works for accounts that haven't explicitly set their wishlist to private

**Private Wishlists:**

- Some users have explicitly set their wishlist to private
- You'll see an error message: "This wishlist is private"
- To view it, you need the owner's Bandcamp cookie

**Recent Change (2024+):** Bandcamp changed their default privacy settings. Many previously private wishlists are now public. This means you can often view wishlists without any authentication that would have required a cookie last year.

### Update Timing

- **Real-time data:** Each request fetches fresh data from Bandcamp - no caching
- **Changes appear immediately:** When someone adds/removes items from their wishlist, those changes are visible on the next refresh
- **No history:** Bandcamp doesn't provide wishlist history - you can only see the current state

### Rate Limiting

The app includes rate limiting to avoid being blocked:

- **200ms delay** between API requests
- **Max 100 pages** per fetch (~1000 items)
- If you get a **429 error** (Too Many Requests), wait a few minutes before trying again

### Cookie Expiration

Bandcamp cookies can expire. If you see authentication errors:

1. Log out and log back in to Bandcamp
2. Get fresh cookies from Developer Tools → Application → Cookies
3. Update your saved cookie in the web app (stored in localStorage) or `.env` file

4. Log in to Bandcamp in your browser
5. Open Developer Tools (F12) > Application > Cookies
6. Copy the values for `identity` and `js_logged_in` cookies
7. Add them to your `.env` file:

```
BANDCAMP_IDENTITY_COOKIE=your_identity_cookie_value
BANDCAMP_JS_LOGGED_IN_COOKIE=1
## Getting Your Bandcamp Cookie

To access private wishlists (or to use the CLI tool), you need a Bandcamp cookie:

1. Log in to Bandcamp in your browser
2. Open Developer Tools (F12) → Application tab (Chrome) or Storage tab (Firefox)
3. Expand "Cookies" → "bandcamp.com"
4. Copy the value of the `identity` cookie

**For the web app:** Enter the cookie value when prompted. It's stored only in your browser's localStorage - never sent to any server.

**For the CLI:** Add it to your `.env` file:

```

BANDCAMP_IDENTITY_COOKIE=your_identity_cookie_value

```

### Privacy Note

Your cookie is stored **only in your browser** (localStorage) when using the web app. It's never sent to any server - the app uses it directly to fetch data from Bandcamp. For the CLI, the cookie stays on your local machine.

## Recommendations

1. **Keep your `.env` file private** - Never commit it to version control
2. **Use strong, unique cookies** - Rotate your Bandcamp cookies periodically
3. **Monitor rate limits** - If you get blocked, reduce the concurrency in `bc_fetch.mjs`
4. **Set up logging** - The script creates `bc_fetch.log` for troubleshooting

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## Troubleshooting

**Common issues:**

- **"This wishlist is private"**: Enter the owner's Bandcamp cookie when prompted
- **"Invalid credentials"**: Your Bandcamp cookies may have expired. Get new ones from your browser.
- **"Rate limited"**: Wait a few minutes before trying again
- **"404 Not Found"**: The username might be incorrect or the profile doesn't exist
- **Web app not loading**: Make sure JavaScript is enabled and try a different browser

## License

ISC
```
