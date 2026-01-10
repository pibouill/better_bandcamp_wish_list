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
import { writeFile } from 'fs/promises';

bcfetch.limiter.updateSettings({ maxConcurrent: 3, minTime: 500 });

const username = process.argv[2];
if (!username) {
  console.error('Usage: node bc_fetch.mjs <username>');
  process.exit(1);
}

const escapeCsv = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

async function backup() {
  const fan = bcfetch.fan;
  let target = username;
  const allItems = [];

  console.log(`🔍 Fetching https://bandcamp.com/${username}/wishlist...\n`);

  while (target) {
    const res = await fan.getWishlist({ target });
    const items = res.items || [];
    allItems.push(...items);
    console.log(`📦 ${items.length} items (total: ${allItems.length})`);

    target = res.continuation || null;
  }

  // Prepare file writes concurrently
  const writeJson = writeFile('wishlist.json', JSON.stringify(allItems, null, 2))
    .then(() => console.log('✅ Full data → wishlist.json'));

  const csvHeaders = ['artist', 'title', 'url', 'current_price', 'original_price', 'release_date'];
  const csvContent = [
    csvHeaders.join(','),
    ...allItems.map(item => [
      escapeCsv(item.artist?.name),
      escapeCsv(item.title),
      escapeCsv(item.url),
      escapeCsv(item.current?.price),
      escapeCsv(item.original?.price),
      escapeCsv(item.releaseDate)
    ].join(','))
  ].join('\n');

  const writeCsv = writeFile('wishlist.csv', csvContent)
    .then(() => console.log('✅ GitHub-ready CSV → wishlist.csv'));

  await Promise.all([writeJson, writeCsv]);
}

backup().catch(console.error);
