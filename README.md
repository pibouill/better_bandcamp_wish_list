33# Better Bandcamp Wishlist

## ⚠️⚠️⚠️ BIIIG ->**WIP**<- ⚠️⚠️⚠️

From my experience, [Bandcamp](https://bandcamp.com)'s wishlist is kinda eh
So me (and AI) are trying to make the experience a little better

**Note: Filtering is broken for now** - trying to fix. Bandcamp's API returns limited data (no release dates, no genres for most items).

## Features

- **Enhanced organization** - Filter by label, genre, tags, and price
- **Multiple sort options** - Sort by release date, date added, artist, or title
- **View modes** - Toggle between grid and list views
- **Export data** - Download your wishlist as JSON or CSV
- **CLI backup tool** - Schedule automatic daily backups using cron
- **Detailed item data** - See labels, genres, tags, prices, and more

## How It Works

This tool accesses your own Bandcamp wishlist to help you manage and navigate it better. Bandcamp's native wishlist is quite limited - this gives you more powerful filtering, sorting, and export capabilities.

### Getting Your Data

To access your wishlist:

1. Enter your Bandcamp username in the web app
2. Your wishlist data is fetched directly from Bandcamp (no data is stored by this app)

If you have your wishlist as private: check below.

## Quick Start (Web App)

### 1. Run Locally

```bash
cd web
npm run dev
```

Then open http://localhost:5173 in your browser.

### 2. Or Visit the Deployed App

Go to the deployed URL (e.g., `your-app.netlify.app`) and enter your Bandcamp username.

### 3. Accessing Private Wishlists

If your wishlist is set to private, you can still use the tool by adding your Bandcamp cookie. This tricks Bandcamp into thinking you're logged in, letting you access your own private wishlist.

**How to get your cookie:**

1. Log into Bandcamp (https://bandcamp.com) in your browser
2. Open Developer Tools (F12) → Application tab (Chrome) or Storage tab (Firefox)
3. Go to Cookies → bandcamp.com
4. Copy the value of the `identity` cookie

**In the web app:** Paste the cookie value in the "Identity Cookie (optional)" field.

**In the CLI:** Add it to your `.env` file as `BANDCAMP_IDENTITY_COOKIE=your_cookie_value`.

Your cookie is stored only in your browser's localStorage (web) or your `.env` file (CLI) - never sent to any server.

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

### Data Privacy

Your wishlist data is fetched directly from Bandcamp each time you use the app - no data is stored by this tool. The web app runs entirely in your browser.

### Private Wishlists

If your wishlist is private, you can still access it by adding your Bandcamp cookie. See the [Accessing Private Wishlists](#3-accessing-private-wishlists) section above for details.

### Rate Limiting

The app includes rate limiting to avoid being blocked:

- **500ms delay** between API requests
- If you get a **429 error** (Too Many Requests), wait a few minutes before trying again

## Troubleshooting

**Common issues:**

- **"This wishlist is private"**: Add your Bandcamp cookie. See [Accessing Private Wishlists](#3-accessing-private-wishlists) above.
- **"Rate limited"**: Wait a few minutes before trying again
- **"404 Not Found"**: The username might be incorrect or the profile doesn't exist
- **Web app not loading**: Make sure JavaScript is enabled and try a different browser

## License

[ISC](https://choosealicense.com/licenses/isc)
