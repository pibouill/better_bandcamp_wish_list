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
bcfetch.limiter.updateSettings({
  maxConcurrent: 3,    // Max simultaneous requests
  minTime: 500         // 500ms between requests
});

import { writeFileSync } from 'fs';

async function backupWishlist(username) {
  const fan = bcfetch.fan;
  let target = username;
  const allItems = [];

  console.log(`Fetching wishlist for ${username}...\n`);

  while (true) {
    const res = await fan.getWishlist({ target });  // Fetches albums/tracks; supports continuation [page:1]
    allItems.push(...res.items);
    console.log(`Fetched ${res.items.length} items (total: ${allItems.length})`);

    if (!res.continuation) {
      console.log('\nComplete!');
      break;
    }
    target = res.continuation;
  }

  // Save as JSON
  writeFileSync('wishlist-backup.json', JSON.stringify(allItems, null, 2));
  console.log('Saved to wishlist-backup.json');

  // Optional: Convert to CSV (artist, album, url, price)
  const csv = [
    'artist,title,url,current_price,original_price',
    ...allItems.map(item => [
      item.artist?.name || '',
      item.title || '',
      item.url || '',
      item.current?.price || '',
      item.original?.price || ''
    ].join(','))
  ].join('\n');
  writeFileSync('wishlist-backup.csv', csv);
  console.log('Saved to wishlist-backup.csv');
}

const username = process.argv[2];  // Run as: node backup-wishlist.js yourusername
if (!username) {
  console.error('Usage: node backup-wishlist.js <your_bandcamp_username>');
  process.exit(1);
}

backupWishlist(username);
