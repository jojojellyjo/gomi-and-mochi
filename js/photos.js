// Joanne's own photo scraps: cut-out PNGs in photos/, listed in photos/manifest.json
// as [{ "file": "seal.png", "label": "wax seal" }, ...]. Missing manifest = no photos.
import { mk, bake } from './textures.js';

let loaded = [];

export async function loadPhotos() {
  try {
    const res = await fetch('photos/manifest.json', { cache: 'no-cache' });
    if (!res.ok) return;
    const list = await res.json();
    const out = await Promise.all(list.map((item) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ label: item.label || 'keepsake', sprite: toSprite(img, item.size || 190) });
      img.onerror = () => resolve(null);
      img.src = 'photos/' + item.file;
    })));
    loaded = out.filter(Boolean);
  } catch (e) { /* no photos yet */ }
}

export function toSprite(img, maxSize) {
  const s = Math.min(1, maxSize / Math.max(img.width, img.height));
  const c = mk(img.width * s, img.height * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return bake(c);
}

export function photoScraps() { return loaded; }
