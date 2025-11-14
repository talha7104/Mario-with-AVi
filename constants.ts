
import type { ObstacleType } from './types';

// Game world dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 400;
export const LEVEL_WIDTH = 1500;
export const GROUND_HEIGHT = 30;

// Player properties
export const PLAYER_WIDTH = 24;
export const PLAYER_HEIGHT = 24;
export const PLAYER_SPEED = 4;
export const JUMP_FORCE = 10;
export const GRAVITY = 0.5;

// Level Data
export const LEVEL_DATA: ObstacleType[] = [
  // Starting platform
  { id: 1, type: 'platform', position: { x: 0, y: 0 }, size: { width: 200, height: GROUND_HEIGHT } },
  // First jump
  { id: 2, type: 'platform', position: { x: 250, y: 50 }, size: { width: 100, height: 20 } },
  // Hazard on ground
  { id: 3, type: 'hazard', position: { x: 400, y: 0 }, size: { width: 20, height: 20 } },
  { id: 4, type: 'platform', position: { x: 380, y: 0 }, size: { width: 60, height: GROUND_HEIGHT } },
  // Second platform section after pit
  { id: 5, type: 'platform', position: { x: 500, y: 0 }, size: { width: 250, height: GROUND_HEIGHT } },
  // Floating platforms
  { id: 6, type: 'platform', position: { x: 600, y: 110 }, size: { width: 80, height: 20 } },
  { id: 7, type: 'platform', position: { x: 720, y: 170 }, size: { width: 80, height: 20 } },
  // Moving hazard (vertical)
  { id: 8, type: 'hazard', position: { x: 900, y: 100 }, size: { width: 20, height: 20 } }, 
  { id: 9, type: 'platform', position: { x: 830, y: 0 }, size: { width: 200, height: GROUND_HEIGHT } },
  // Final platform
  { id: 10, type: 'platform', position: { x: 1100, y: 0 }, size: { width: 300, height: GROUND_HEIGHT } },
  // Small block to jump over
  { id: 11, type: 'platform', position: { x: 1200, y: 0 }, size: { width: 40, height: 40 } },
  // Finish line
  { id: 12, type: 'finish', position: { x: 1450, y: 0 }, size: { width: 10, height: 40 } },
];
