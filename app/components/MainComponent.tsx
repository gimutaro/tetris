"use client";
import React from "react";

interface Piece {
  shape: number[][];
  position: { x: number; y: number };
  color: string;
}

function MainComponent() {
    const [grid, setGrid] = React.useState<(string | 0)[][]>(() => 
      Array.from({length: 20}, () => Array.from({length: 10}, () => 0))
    );
    const [currentPiece, setCurrentPiece] = React.useState<Piece | null>(null);
    const [gameOver, setGameOver] = React.useState(false);
    const [score, setScore] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);
  
    const pieces = [
      [[1, 1, 1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1, 1], [0, 1, 0]],
      [[1, 1, 1], [1, 0, 0]],
      [[1, 1, 1], [0, 0, 1]],
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1, 1], [1, 1, 0]]
    ];
  
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
  
    React.useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (gameOver || isPaused) return;
        switch (e.key) {
          case 'ArrowLeft':
            movePiece(-1, 0);
            break;
          case 'ArrowRight':
            movePiece(1, 0);
            break;
          case 'ArrowDown':
            movePiece(0, 1);
            break;
          case 'ArrowUp':
            rotatePiece();
            break;
        }
      };
  
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPiece, grid, gameOver, isPaused]);
  
    React.useEffect(() => {
      if (!currentPiece && !gameOver && !isPaused) {
        spawnPiece();
      }
      const gameLoop = setInterval(() => {
        if (!gameOver && !isPaused) {
          movePiece(0, 1);
        }
      }, 1000);
      return () => clearInterval(gameLoop);
    }, [currentPiece, gameOver, isPaused]);
  
    const spawnPiece = () => {
      const pieceIndex = Math.floor(Math.random() * pieces.length);
      const piece = pieces[pieceIndex];
      const color = colors[pieceIndex];
      const newPiece: Piece = {
        shape: piece,
        position: { x: Math.floor(grid[0].length / 2) - Math.floor(piece[0].length / 2), y: 0 },
        color: color
      };
      if (isColliding(newPiece)) {
        setGameOver(true);
      } else {
        setCurrentPiece(newPiece);
      }
    };
  
    const movePiece = (dx: number, dy: number) => {
      if (!currentPiece) return;
      const newPiece: Piece = {
        ...currentPiece,
        position: { x: currentPiece.position.x + dx, y: currentPiece.position.y + dy }
      };
      if (!isColliding(newPiece)) {
        setCurrentPiece(newPiece);
      } else if (dy > 0) {
        mergePiece();
        clearLines();
        spawnPiece();
      }
    };
  
    const rotatePiece = () => {
      if (!currentPiece) return;
      const rotatedShape = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
      );
      const newPiece: Piece = { ...currentPiece, shape: rotatedShape };
      if (!isColliding(newPiece)) {
        setCurrentPiece(newPiece);
      }
    };
  
    const isColliding = (piece: Piece): boolean => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const newX = piece.position.x + x;
            const newY = piece.position.y + y;
            if (newX < 0 || newX >= grid[0].length || newY >= grid.length || (newY >= 0 && grid[newY][newX] !== 0)) {
              return true;
            }
          }
        }
      }
      return false;
    };
  
    const mergePiece = () => {
      if (!currentPiece) return;
      const newGrid = [...grid];
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            const newY = y + currentPiece.position.y;
            const newX = x + currentPiece.position.x;
            if (newY >= 0 && newX >= 0) {
              newGrid[newY][newX] = currentPiece.color;
            }
          }
        });
      });
      setGrid(newGrid);
    };
  
    const clearLines = () => {
      let newGrid = grid.filter(row => row.some(cell => cell === 0));
      const clearedLines = grid.length - newGrid.length;
      const newScore = score + clearedLines * 100;
      setScore(newScore);
      while (newGrid.length < grid.length) {
        newGrid.unshift(Array(grid[0].length).fill(0));
      }
      setGrid(newGrid);
    };
  
    const resetGame = () => {
      setGrid(Array.from({length: 20}, () => Array.from({length: 10}, () => 0)));
      setCurrentPiece(null);
      setGameOver(false);
      setScore(0);
      setIsPaused(false);
      spawnPiece();
    };
  
    const togglePause = () => {
      setIsPaused(!isPaused);
    };
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 font-sans">
        <h1 className="text-4xl font-bold mb-8 text-white">Tetris</h1>
        <div className="relative">
          <div className="grid grid-cols-10 gap-px bg-gray-700 p-2 rounded-lg shadow-lg">
            {grid.map((row, y) => (
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    cell || (currentPiece && 
                      y >= currentPiece.position.y && 
                      y < currentPiece.position.y + currentPiece.shape.length &&
                      x >= currentPiece.position.x && 
                      x < currentPiece.position.x + currentPiece.shape[0].length &&
                      currentPiece.shape[y - currentPiece.position.y][x - currentPiece.position.x]
                        ? cell || currentPiece.color 
                        : 'bg-gray-800')
                  }`}
                />
              ))
            ))}
          </div>
          {(gameOver || isPaused) && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-white text-center">
                <h2 className="text-3xl font-bold mb-4">{gameOver ? 'Game Over' : 'Paused'}</h2>
                <p className="text-xl mb-4">Score: {score}</p>
                {gameOver ? (
                  <button
                    onClick={resetGame}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Play Again
                  </button>
                ) : (
                  <button
                    onClick={togglePause}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Resume
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 text-white text-xl">Score: {score}</div>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={togglePause}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={resetGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Reset
          </button>
        </div>
        <div className="mt-8 text-white text-sm">
          <p>Use arrow keys to move and rotate the pieces</p>
          <p>↑: Rotate, ←: Left, →: Right, ↓: Down</p>
        </div>
      </div>
    );
}

export default MainComponent;