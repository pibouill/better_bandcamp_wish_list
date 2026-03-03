// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   bc_fetch.js                                        :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: pibouill <pibouill@student.42prague.com>   +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2026/01/09 19:07:25 by pibouill          #+#    #+#             //
//   Updated: 2026/01/09 19:07:27 by pibouill         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import bcfetch from 'bandcamp-fetch';
import { writeFileSync, existsSync, readFileSync } from 'fs';

bcfetch.limiter.updateSettings({ maxConcurrent: 8, minTime: 200 });

const username = process.argv[2];
if (!username) {
  console.error('Usage: node bc_fetch.mjs <username>');
  process.exit(1);
}

async function backup() {
  const fan = bcfetch.fan;
  bcfetch.setCookie('identity=7%09nlywcyxBhNCUySPCRqMZTKnQ6zGbx5vrnRUd2SofZn4%3D%09%7B%22id%22%3A2442402288%2C%22ex%22%3A0%7D; js_logged_in=1');
  
  let target = username;
  const allItems = [];
  let pages = 0;
  const maxPages = 100;

  console.log(`⚡ FAST MODE: https://bandcamp.com/${username}/wishlist\n`);

  while (target && pages++ < maxPages) {
    const res = await fan.getWishlist({ target });
    
    if (res.items?.length) {
      allItems.push(...res.items);
      console.log(`📦 ${allItems.length} items (${pages} pages)`);
    }
    
    target = res.continuation;
    await new Promise(r => setTimeout(r, 150));
  }

  // 📊 CHANGE DETECTION
  let changes = { added: 0, removed: 0, totalNew: allItems.length };
  
  if (existsSync('wishlist.json')) {
    const oldItems = JSON.parse(readFileSync('wishlist.json', 'utf8'));
    const oldUrls = new Set(oldItems.map(item => item.url));
    const newUrls = new Set(allItems.map(item => item.url));
    
    // Count additions/removals
    for (const url of newUrls) if (!oldUrls.has(url)) changes.added++;
    for (const url of oldUrls) if (!newUrls.has(url)) changes.removed++;
    
    console.log(`\n📊 CHANGES:`);
    console.log(`➕ Added: ${changes.added} items`);
    console.log(`➖ Removed: ${changes.removed} items`);
    console.log(`📈 Total now: ${allItems.length} (was ${oldItems.length})`);
    console.log(`🔄 Net change: ${allItems.length - oldItems.length} items`);
  } else {
    console.log(`\n📊 NEW BACKUP: ${allItems.length} items (first time)`);
  }

  // Save files
  writeFileSync('wishlist.json', JSON.stringify(allItems, null, 2));
  
  const headers = ['type', 'artist', 'title', 'url', 'current_price', 'original_price', 'release_date'];
  const csvRows = allItems.map(item => [
    `"${item.type || 'unknown'}"`,
    `"${(item.artist?.name || '').replace(/"/g, '""')}"`,
    `"${(item.type === 'track' ? item.name : item.title || '').replace(/"/g, '""')}"`,
    `"${item.url || ''}"`,
    `"${item.current?.price || ''}"`,
    `"${item.original?.price || ''}"`,
    `"${item.releaseDate || ''}"`
  ].join(','));
  
  writeFileSync('wishlist.csv', [headers.join(','), ...csvRows].join('\n'));
  
  console.log(`\n🎉 DONE: ${allItems.length} items saved!`);
}

backup().catch(console.error);

