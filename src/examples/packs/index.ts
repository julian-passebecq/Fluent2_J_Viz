import { economyPacks } from './economy.js';
import { computePacks } from './compute.js';
import { eventPacks } from './events.js';
export const storyPacks = [...economyPacks, ...computePacks, ...eventPacks];
