import sharp from 'sharp';
import {readFileSync} from 'node:fs';
const {assets}=JSON.parse(readFileSync('docs/sector-image-prompts.json','utf8'));
for(const asset of assets){await sharp(asset.source).webp({quality:84}).toFile(asset.destination);console.log(asset.destination);}
