export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  position: Vector2D;
  size: { width: number; height: number };
}

export interface ObstacleType extends GameObject {
  id: number;
  type: 'platform' | 'hazard' | 'finish';
}

export interface DynamicObstacleType extends ObstacleType {
  originalY: number;
}

export type GameStatus = 'ready' | 'playing' | 'gameOver' | 'win';

export interface KeysState {
  left: boolean;
  right: boolean;
  up: boolean;
}
