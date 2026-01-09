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
import { writeFileSync } from 'fs';

bcfetch.limiter.updateSettings({ maxConcurrent: 3, minTime: 500 });  // Rate limit

const username = process.argv[2];
if (!username) {
  console.error('Usage: node bc_fetch.mjs <username>');
  process.exit(1);
}

async function backup() {
  const fan = bcfetch.fan;
  let target = username;
  const allItems = [];

  console.log(`🔍 Fetching https://bandcamp.com/${username}/wishlist...\n`);

  while (true) {
    const res = await fan.getWishlist({ target });
    allItems.push(...(res.items || []));
    console.log(`📦 ${res.items?.length || 0} items (total: ${allItems.length})`);

    if (!res.continuation) break;
    target = res.continuation;
  }

  // JSON (full data)
  writeFileSync('wishlist.json', JSON.stringify(allItems, null, 2));
  console.log('✅ Full data → wishlist.json');

  // FIXED GitHub CSV
  const headers = ['artist', 'title', 'url', 'current_price', 'original_price', 'release_date'];
  const csvRows = allItems.map(item => [
    `"${(item.artist?.name || '').replace(/"/g, '""')}"`,
    `"${(item.title || '').replace(/"/g, '""')}"`,
    `"${item.url || ''}"`,
    `"${item.current?.price || ''}"`,
    `"${item.original?.price || ''}"`,
    `"${item.releaseDate || ''}"`
  ].join(','));
  const csvContent = [headers.join(','), ...csvRows].join('\n');
  writeFileSync('wishlist.csv', csvContent);
  console.log('✅ GitHub-ready CSV → wishlist.csv');
}

backup().catch(console.error);
