
import React, { useState } from 'react';
import Game from './components/Game';

const App: React.FC = () => {
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center font-mono text-white p-4">
      <header className="text-center mb-4">
        <h1 className="text-4xl font-bold tracking-widest uppercase">React Pixel Platformer</h1>
      </header>
      <main>
        <Game speedMultiplier={speedMultiplier} />
      </main>
      <div className="mt-4 w-full max-w-xs text-center">
        <label htmlFor="speed-control" className="block mb-2 text-sm font-medium text-gray-400">
          Speed Control: {speedMultiplier.toFixed(1)}x
        </label>
        <input
          id="speed-control"
          type="range"
          min="0.5"
          max="2.5"
          step="0.1"
          value={speedMultiplier}
          onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <footer className="mt-4 text-center text-gray-400">
        <p>Use <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Arrow Keys</kbd> or <kbd className="font-sans px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">WASD</kbd> to move and jump.</p>
        <p>Avoid red hazards. Reach the green flag to win.</p>
      </footer>
    </div>
  );
};

export default App;
