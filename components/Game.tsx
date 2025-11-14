
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  LEVEL_WIDTH,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  JUMP_FORCE,
  GRAVITY,
  LEVEL_DATA,
} from '../constants';
import type { Vector2D, ObstacleType, GameStatus, DynamicObstacleType } from '../types';

// --- Helper Components (defined outside main component) ---

interface CharacterProps {
  isJumping: boolean;
  direction: 'left' | 'right';
}
const Character: React.FC<CharacterProps> = React.memo(({ isJumping, direction }) => {
  const bodyHeight = isJumping ? PLAYER_HEIGHT - 2 : PLAYER_HEIGHT - 6;
  const bodyY = PLAYER_HEIGHT - bodyHeight;
  const eyeY = bodyY + 8;
  const eyeOffsetX = 4;
  const pupilOffsetX = 0.5;

  return (
    <svg
      width={PLAYER_WIDTH}
      height={PLAYER_HEIGHT}
      viewBox={`0 0 ${PLAYER_WIDTH} ${PLAYER_HEIGHT}`}
      style={{
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
        imageRendering: 'pixelated',
      }}
    >
      <g fill="none" stroke="#1E293B" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {/* Body */}
        <rect x="3" y={bodyY} width={PLAYER_WIDTH - 6} height={bodyHeight - 4} rx="8" fill="#60A5FA" />
        
        {/* Legs */}
        <path d={`M ${PLAYER_WIDTH/2 - 5} ${PLAYER_HEIGHT-2} l 0 -4`} />
        <path d={`M ${PLAYER_WIDTH/2 + 5} ${PLAYER_HEIGHT-2} l 0 -4`} />

        {/* Eyes */}
        <circle cx={PLAYER_WIDTH/2 - eyeOffsetX} cy={eyeY} r="2" fill="white" stroke="none" />
        <circle cx={PLAYER_WIDTH/2 + eyeOffsetX} cy={eyeY} r="2" fill="white" stroke="none" />
        <circle cx={PLAYER_WIDTH/2 - eyeOffsetX + pupilOffsetX} cy={eyeY} r="1" fill="#1E293B" stroke="none" />
        <circle cx={PLAYER_WIDTH/2 + eyeOffsetX + pupilOffsetX} cy={eyeY} r="1" fill="#1E293B" stroke="none" />
      </g>
    </svg>
  );
});

interface PlayerProps {
  position: Vector2D;
  direction: 'left' | 'right';
  isJumping: boolean;
}
const Player: React.FC<PlayerProps> = React.memo(({ position, direction, isJumping }) => (
  <div
    style={{
      position: 'absolute',
      left: `${position.x}px`,
      bottom: `${position.y}px`,
      width: `${PLAYER_WIDTH}px`,
      height: `${PLAYER_HEIGHT}px`,
    }}
  >
    <Character isJumping={isJumping} direction={direction} />
  </div>
));

interface ObstacleProps {
  obstacle: ObstacleType;
}
const Obstacle: React.FC<ObstacleProps> = React.memo(({ obstacle }) => {
  const obstacleStyles: { [key: string]: string } = {
    platform: 'bg-yellow-700 border-2 border-black',
    hazard: 'bg-red-600 animate-pulse border-2 border-black',
    finish: 'bg-green-500',
  };
  return (
    <div
      className={obstacleStyles[obstacle.type]}
      style={{
        position: 'absolute',
        left: `${obstacle.position.x}px`,
        bottom: `${obstacle.position.y}px`,
        width: `${obstacle.size.width}px`,
        height: `${obstacle.size.height}px`,
      }}
    />
  );
});

interface GameOverlayProps {
  status: GameStatus;
  onRestart: () => void;
  onStart: () => void;
}
const GameOverlay: React.FC<GameOverlayProps> = ({ status, onRestart, onStart }) => {
  if (status === 'playing') return null;

  const content = {
    ready: { message: 'Ready?', buttonText: 'Start Game', action: onStart },
    gameOver: { message: 'Game Over', buttonText: 'Restart', action: onRestart },
    win: { message: 'You Win!', buttonText: 'Restart', action: onRestart },
  }[status];

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10">
      <h2 className="text-6xl font-bold mb-4 text-white">{content.message}</h2>
      <button
        onClick={content.action}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-2xl"
      >
        {content.buttonText}
      </button>
    </div>
  );
};

// --- Main Game Component ---

interface PlayerState {
  pos: Vector2D;
  vel: Vector2D;
  onGround: boolean;
  direction: 'left' | 'right';
}

interface GameProps {
  speedMultiplier: number;
}

const Game: React.FC<GameProps> = ({ speedMultiplier }) => {
  const getInitialPlayerState = (): PlayerState => ({
    pos: { x: 50, y: 50 },
    vel: { x: 0, y: 0 },
    onGround: true,
    direction: 'right',
  });
  const getInitialObstacles = () => LEVEL_DATA.map(o => o.id === 8 ? { ...o, originalY: o.position.y } : o) as (ObstacleType | DynamicObstacleType)[];

  const [playerState, setPlayerState] = useState<PlayerState>(getInitialPlayerState());
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready');
  const [obstacles, setObstacles] = useState<(ObstacleType | DynamicObstacleType)[]>(getInitialObstacles());
  
  const keys = useKeyboardControls();
  const gameLoopRef = useRef<number>();

  const resetGame = () => {
    setPlayerState(getInitialPlayerState());
    setObstacles(getInitialObstacles());
    setGameStatus('playing');
  };

  const startGame = () => {
    setGameStatus('playing');
  };

  const gameLoop = useCallback(() => {
    if (gameStatus !== 'playing') return;

    // Update dynamic obstacles
    setObstacles(prev => prev.map(obs => {
      if ('originalY' in obs) {
        const time = Date.now() / 600;
        const newY = obs.originalY + Math.sin(time) * 60;
        return { ...obs, position: { ...obs.position, y: newY } };
      }
      return obs;
    }));
    
    setPlayerState(prevState => {
      const { pos: prevPos, vel: prevVel, onGround: prevOnGround, direction: prevDirection } = prevState;

      let vx = 0;
      let nextDirection = prevDirection;
      const currentSpeed = PLAYER_SPEED * speedMultiplier;

      if (keys.left) {
        vx = -currentSpeed;
        nextDirection = 'left';
      }
      if (keys.right) {
        vx = currentSpeed;
        nextDirection = 'right';
      }

      let vy = prevVel.y - GRAVITY;
      if (keys.up && prevOnGround) {
        vy = JUMP_FORCE;
      }
      
      let nextVel = { x: vx, y: vy };
      let nextPos = { x: prevPos.x + nextVel.x, y: prevPos.y + nextVel.y };
      let isGrounded = false;
      
      // World bounds
      if (nextPos.x < 0) nextPos.x = 0;
      if (nextPos.x + PLAYER_WIDTH > LEVEL_WIDTH) nextPos.x = LEVEL_WIDTH - PLAYER_WIDTH;

      // Check collisions with obstacles
      for (const obs of obstacles) {
        const playerRect = { ...nextPos, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
        const obsRect = { x: obs.position.x, y: obs.position.y, width: obs.size.width, height: obs.size.height };

        if (playerRect.x < obsRect.x + obsRect.width && playerRect.x + playerRect.width > obsRect.x &&
            playerRect.y < obsRect.y + obsRect.height && playerRect.y + playerRect.height > obsRect.y) {
          
          if (obs.type === 'hazard') {
            setGameStatus('gameOver');
            return prevState;
          }
          if (obs.type === 'finish') {
            setGameStatus('win');
            return prevState;
          }
          
          // Collision resolution
          const prevPlayerBottom = prevPos.y;
          const obsTop = obs.position.y + obs.size.height;
          if (prevPlayerBottom >= obsTop && nextVel.y < 0) { // Landing on top
            nextPos.y = obsTop;
            nextVel.y = 0;
            isGrounded = true;
          } else if (prevPos.y + PLAYER_HEIGHT <= obs.position.y && nextVel.y > 0) { // Hitting from bottom
            nextPos.y = obs.position.y - PLAYER_HEIGHT;
            nextVel.y = 0;
          } else if (prevPos.x + PLAYER_WIDTH <= obs.position.x && nextVel.x > 0) { // Hitting from left
             nextPos.x = obs.position.x - PLAYER_WIDTH;
             nextVel.x = 0;
          } else if (prevPos.x >= obs.position.x + obs.size.width && nextVel.x < 0) { // Hitting from right
             nextPos.x = obs.position.x + obs.size.width;
             nextVel.x = 0;
          }
        }
      }
      
      // Pit detection
      if (nextPos.y < 0) {
        setGameStatus('gameOver');
        return prevState;
      }
      
      return { pos: nextPos, vel: nextVel, onGround: isGrounded, direction: nextDirection };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [keys, gameStatus, obstacles, speedMultiplier]);

  useEffect(() => {
    if (gameStatus === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus, gameLoop]);
  
  const cameraX = Math.max(0, Math.min(playerState.pos.x - GAME_WIDTH / 2, LEVEL_WIDTH - GAME_WIDTH));
  const isJumping = playerState.vel.y > 0 && !playerState.onGround;

  return (
    <div
      className="bg-sky-400 overflow-hidden relative border-4 border-black"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
    >
      <GameOverlay status={gameStatus} onRestart={resetGame} onStart={startGame} />
      <div
        className="relative w-full h-full"
        style={{
          width: `${LEVEL_WIDTH}px`,
          transform: `translateX(-${cameraX}px)`,
          transition: 'transform 0.1s linear',
        }}
      >
        <Player
          position={playerState.pos}
          direction={playerState.direction}
          isJumping={isJumping}
        />
        {obstacles.map(obs => (
          <Obstacle key={obs.id} obstacle={obs} />
        ))}
      </div>
    </div>
  );
};

export default Game;
