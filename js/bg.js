import { wood } from './textures.js';

let desk = null;
export function getDesk() {
  if (!desk) desk = wood(1280, 800, '#6e4a30');
  return desk;
}
