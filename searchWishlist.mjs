import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WISHLIST_FILE = join(__dirname, 'wishlist.json');

try {
	const wishlistData = readFileSync(WISHLIST_FILE, 'utf8');
	const wishlist = JSON.parse(wishlistData);
	console.log(`Successfully loaded ${wishlist.length} items from wishlist.`);

	const labelToSearch = process.argv[2]; // Get label from command line argument
	if (!labelToSearch) {
		console.log("Usage: node searchWishlist.mjs <label_to_search>");
		process.exit(0);
	}

	const results = searchByLabel(wishlist, labelToSearch);

	if (results.length > 0) {
		console.log(`\nFound ${results.length} items for label "${labelToSearch}":`);
		results.forEach(item => {
			console.log(`- ${item.name} by ${item.artist.name} (${item.url})`);
		});
	} else {
		console.log(`\nNo items found for label "${labelToSearch}".`);
	}

} catch (error) {
	console.error(`Error reading or parsing wishlist file: ${error.message}`);
	process.exit(1);
}

function getLabelFromUrl(url) {
	try {
		const hostname = new URL(url).hostname;
		const match = hostname.match(/^(.*?)\.bandcamp\.com$/);
		if (match && match[1]) {
			return match[1];
		}
	} catch (error) {
		console.warn(`Could not parse URL: ${url}, error: ${error.message}`);
	}
	return null;
}

function searchByLabel(wishlist, label) {
	if (!label) {
		console.log("Please provide a label to search for.");
		return [];
	}
	const lowerCaseLabel = label.toLowerCase();
	return wishlist.filter(item => {
		const itemLabel = getLabelFromUrl(item.url);
		return itemLabel && itemLabel.toLowerCase().includes(lowerCaseLabel);
	});
}
