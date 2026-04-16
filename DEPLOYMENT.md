# Deployment Guide

## Deploy to Netlify

### Option 1: Via Dashboard

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"** and authorize
4. Select your repository
5. Configure:
   - **Build command:** `cd web && npm run build`
   - **Publish directory:** `web/build`
6. Click **"Deploy site"**

### Option 2: Via CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=web/build
```

---

## Custom Domain

### Step 1: Add Domain in Netlify

1. Go to your site in Netlify dashboard
2. **Site settings** → **Domain management** → **Domains**
3. Enter `2bwl.eu` and click "Verify"
4. Click "Yes, add domain"

### Step 2: Update DNS at Porkbun

Netlify will provide these DNS records:

```
Type    Name    Value
A       @       75.2.60.5
CNAME   www     your-site.netlify.app
```

**In Porkbun:**

1. Log into Porkbun dashboard
2. Go to **DNS** for your domain
3. Add the records Netlify shows you
4. Save

### Step 3: Wait for Propagation

DNS can take **0-24 hours** to propagate. Use [dnschecker.org](https://dnschecker.org) to verify.

---

## Custom Domain

### Where to Buy a Domain

| Registrar                            | Pros                                     | Cons                    |
| ------------------------------------ | ---------------------------------------- | ----------------------- |
| [Porkbun](https://porkbun.com)       | **At cost pricing + FREE WHOIS privacy** | Less known              |
| [Cloudflare](https://cloudflare.com) | Best DNS, cheap privacy                  | Slightly more expensive |
| [Namecheap](https://namecheap.com)   | Popular, easy UI                         | Privacy costs extra     |

**Recommendation:** **[Porkbun](https://porkbun.com)**

- **At cost pricing** - They charge exactly what the domain registry charges, no markup
- **Free WHOIS privacy** included - Your name, address, and email are hidden from public WHOIS lookups
- Blocks spam, scammers, and telemarketers from seeing your contact info
- Clean, simple UI

### DNS Records Explained

After adding your domain in Netlify, they'll show you records like:

```
Type    Name    Value
A       @       75.2.60.5
CNAME   www     your-site.netlify.app
```

| Record       | What it does                                           |
| ------------ | ------------------------------------------------------ |
| **A Record** | Points your domain (`example.com`) to Netlify's server |
| **CNAME**    | Points `www.example.com` to your Netlify site          |

### How to Update DNS

1. **Buy domain** from your chosen registrar
2. In Netlify: Site settings → Domain management → Add custom domain
3. Copy the DNS records Netlify provides
4. **In your registrar's DNS settings:** Add those records
5. **Wait** - DNS takes 0-24 hours to propagate

### Common Registrar DNS Locations

- **Namecheap**: Advanced DNS → Add records
- **Cloudflare**: DNS → Add record
- **GoDaddy**: DNS Management → Add
- **Porkbun**: DNS → Add records

---

## Post-Deployment

### Verify Everything Works

1. Visit your Netlify URL
2. Enter a Bandcamp username
3. Verify the wishlist loads
4. Test search/filter functionality
5. Test download buttons (JSON/CSV)

### Common Issues

| Issue                | Solution                             |
| -------------------- | ------------------------------------ |
| Site not loading     | Check build logs in Netlify          |
| Wishlist not loading | Check API endpoint works             |
| Domain not working   | Wait for DNS propagation (up to 24h) |
| SSL not working      | Enable "HTTPS" in Netlify settings   |

---

## Security Notes

- Never commit `.env` files with real credentials
- Your cookie is stored only in browser localStorage
- Netlify provides free SSL certificates
- The `.env` file is already in `.gitignore`
