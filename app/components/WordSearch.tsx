// app/components/WordSearch.tsx
"use client";

import { useState, useEffect } from 'react';

interface WordSearchProps {
  category: 'obstetricia' | 'ginecologia' | 'lactancia' | 'neonatologia';
}

interface WordPosition {
  word: string;
  cells: string[]; // Array de "row,col"
  direction: 'horizontal' | 'vertical' | 'diagonal';
}

const WORD_LISTS = {
  obstetricia: [
    'PARTO', 'CESAREA', 'FETO', 'PLACENTA', 'AMNIOS',
    'CORDON', 'UTERO', 'CERVIX', 'PELVIS', 'PRENATAL', 'EMBRION', 'GRAVIDA'
  ],
  ginecologia: [
    'OVARIO', 'UTERO', 'VAGINA', 'ENDOMETRIO', 'MIOMA',
    'QUISTE', 'CICLO', 'HORMONA', 'MATRIZ', 'CERVIX', 'MENOPAUSIA', 'OVULACION'
  ],
  lactancia: [
    'LECHE', 'PECHO', 'CALOSTRO', 'AREOLA', 'SUCCION',
    'PEZON', 'APEGO', 'NUTRICION', 'REFLEJO', 'MADRE', 'LACTANCIA', 'EXTRACCION'
  ],
  neonatologia: [
    'RECIEN', 'APGAR', 'NEONATO', 'PESO', 'TALLA',
    'ICTERICIA', 'REFLEJO', 'SUCCION', 'LLANTO', 'CUNA', 'PREMATURO', 'TERMINO'
  ]
};

const GRID_SIZE = 14;
const POINTS_PER_WORD = 10;
const DIAGONAL_BONUS = 5;

export default function WordSearch({ category }: WordSearchProps) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [wordPositions, setWordPositions] = useState<WordPosition[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<{row: number, col: number} | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    generateGrid();
    loadStats();
  }, [category]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/game-stats?gameType=wordsearch');
      if (response.ok) {
        const { stats } = await response.json();
        setStreak(stats.currentStreak);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveStats = async (won: boolean, gameScore: number, gameStreak: number) => {
    try {
      await fetch('/api/game-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'wordsearch',
          won,
          score: gameScore,
          streak: gameStreak
        })
      });
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  };

  const generateGrid = () => {
    const wordList = WORD_LISTS[category];
    const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill('')
    );
    
    const placedWords: string[] = [];
    const positions: WordPosition[] = [];
    
    // Mezclar palabras aleatoriamente
    const shuffledWords = [...wordList].sort(() => Math.random() - 0.5);
    
    // Intentar colocar cada palabra con diferentes direcciones
    shuffledWords.forEach(word => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 150) {
        // Elegir dirección aleatoria (horizontal, vertical, o diagonal)
        const directions: ('horizontal' | 'vertical' | 'diagonal')[] = ['horizontal', 'vertical', 'diagonal'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        
        if (canPlaceWord(newGrid, word, row, col, direction)) {
          const cells = placeWord(newGrid, word, row, col, direction);
          placedWords.push(word);
          positions.push({ word, cells, direction });
          placed = true;
        }
        attempts++;
      }
    });
    
    // Rellenar espacios vacíos con letras aleatorias
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
    
    setGrid(newGrid);
    setWords(placedWords);
    setWordPositions(positions);
    setFoundWords(new Set());
    setFoundCells(new Set());
    setSelectedCells(new Set());
    setScore(0);
  };

  const canPlaceWord = (grid: string[][], word: string, row: number, col: number, direction: string): boolean => {
    if (direction === 'horizontal') {
      if (col + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) {
          return false;
        }
      }
    } else if (direction === 'vertical') {
      if (row + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row + i][col] !== '' && grid[row + i][col] !== word[i]) {
          return false;
        }
      }
    } else if (direction === 'diagonal') {
      if (row + word.length > GRID_SIZE || col + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row + i][col + i] !== '' && grid[row + i][col + i] !== word[i]) {
          return false;
        }
      }
    }
    return true;
  };

  const placeWord = (grid: string[][], word: string, row: number, col: number, direction: string): string[] => {
    const cells: string[] = [];
    
    if (direction === 'horizontal') {
      for (let i = 0; i < word.length; i++) {
        grid[row][col + i] = word[i];
        cells.push(`${row},${col + i}`);
      }
    } else if (direction === 'vertical') {
      for (let i = 0; i < word.length; i++) {
        grid[row + i][col] = word[i];
        cells.push(`${row + i},${col}`);
      }
    } else if (direction === 'diagonal') {
      for (let i = 0; i < word.length; i++) {
        grid[row + i][col + i] = word[i];
        cells.push(`${row + i},${col + i}`);
      }
    }
    
    return cells;
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setStartCell({row, col});
    setSelectedCells(new Set([`${row},${col}`]));
  };
  const handleTouchStart = (row: number, col: number, e: React.TouchEvent) => {
    e.preventDefault();
    setIsSelecting(true);
    setStartCell({ row, col });
    setSelectedCells(new Set([`${row},${col}`]));
  };
  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting || !startCell) return;
    
    const newSelected = new Set<string>();
    
    // Selección horizontal, vertical o diagonal
    if (row === startCell.row) {
      // Horizontal
      const minCol = Math.min(startCell.col, col);
      const maxCol = Math.max(startCell.col, col);
      for (let c = minCol; c <= maxCol; c++) {
        newSelected.add(`${row},${c}`);
      }
    } else if (col === startCell.col) {
      // Vertical
      const minRow = Math.min(startCell.row, row);
      const maxRow = Math.max(startCell.row, row);
      for (let r = minRow; r <= maxRow; r++) {
        newSelected.add(`${r},${col}`);
      }
    } else if (Math.abs(row - startCell.row) === Math.abs(col - startCell.col)) {
      // Diagonal
      const steps = Math.abs(row - startCell.row);
      const rowDir = row > startCell.row ? 1 : -1;
      const colDir = col > startCell.col ? 1 : -1;
      for (let i = 0; i <= steps; i++) {
        newSelected.add(`${startCell.row + (i * rowDir)},${startCell.col + (i * colDir)}`);
      }
    }
    
    setSelectedCells(newSelected);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting || !startCell) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;
    
    const cellData = element.getAttribute('data-cell');
    if (!cellData) return;
    
    const [row, col] = cellData.split(',').map(Number);
    handleMouseEnter(row, col);
  };

  const handleMouseUp = async () => {
    if (!isSelecting || selectedCells.size === 0) {
      setIsSelecting(false);
      setStartCell(null);
      setSelectedCells(new Set());
      return;
    }
    
    // Obtener las celdas seleccionadas ordenadas
    const cellsArray = Array.from(selectedCells).sort();
    
    // Verificar si coincide con alguna palabra
    for (const wordPos of wordPositions) {
      const wordCells = wordPos.cells.sort();
      
      // Comparar si las celdas seleccionadas coinciden exactamente
      if (cellsArray.length === wordCells.length &&
          cellsArray.every((cell, idx) => cell === wordCells[idx])) {
        
        if (!foundWords.has(wordPos.word)) {
          // ¡Palabra encontrada!
          const newFoundWords = new Set(foundWords);
          newFoundWords.add(wordPos.word);
          setFoundWords(newFoundWords);
          
          // Marcar las celdas como encontradas permanentemente
          const newFoundCells = new Set(foundCells);
          wordPos.cells.forEach(cell => newFoundCells.add(cell));
          setFoundCells(newFoundCells);
          
          // Calcular puntos con racha y bonus diagonal
          const newStreak = streak + 1;
          setStreak(newStreak);
          const bonus = newStreak > 1 ? (newStreak - 1) * 5 : 0;
          const diagonalBonus = wordPos.direction === 'diagonal' ? DIAGONAL_BONUS : 0;
          const wordScore = POINTS_PER_WORD + bonus + diagonalBonus;
          const newScore = score + wordScore;
          setScore(newScore);
          
          // Si es la última palabra, guardar en BD
          if (newFoundWords.size === words.length) {
            await saveStats(true, newScore, newStreak);
          }
          
          break;
        }
      }
    }
    
    setIsSelecting(false);
    setStartCell(null);
    setSelectedCells(new Set());
  };

  const getCategoryColor = () => {
    switch(category) {
      case 'obstetricia': return 'from-blue-500 to-cyan-600';
      case 'ginecologia': return 'from-rose-500 to-pink-600';
      case 'lactancia': return 'from-pink-500 to-rose-600';
      case 'neonatologia': return 'from-teal-500 to-emerald-600';
      default: return 'from-blue-500 to-cyan-600';
    }
  };

  const getCategoryTitle = () => {
    switch(category) {
      case 'obstetricia': return 'Obstetricia';
      case 'ginecologia': return 'Ginecología';
      case 'lactancia': return 'Lactancia Materna';
      case 'neonatologia': return 'Neonatología';
      default: return 'Obstetricia';
    }
  };

  const progress = (foundWords.size / words.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              🔤 Sopa de Letras Médica
            </h3>
            <p className="text-sm text-gray-600">
              Tema: <span className="font-bold text-gray-900">{getCategoryTitle()}</span>
            </p>
          </div>
          <button
            onClick={generateGrid}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105"
          >
            🔄 Nuevo Juego
          </button>
        </div>
        
        {/* Sistema de puntos y progreso */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 border-2 border-yellow-200">
            <p className="text-xs text-gray-600 font-medium mb-1">Puntuación</p>
            <p className="text-2xl font-bold text-yellow-700">{score}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border-2 border-purple-200">
            <p className="text-xs text-gray-600 font-medium mb-1">Racha</p>
            <p className="text-2xl font-bold text-purple-700">{streak} 🔥</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border-2 border-blue-200">
            <p className="text-xs text-gray-600 font-medium mb-1">Palabras</p>
            <p className="text-2xl font-bold text-blue-700">{foundWords.size}/{words.length}</p>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">Progreso</span>
            <span className="text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getCategoryColor()} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Grid de búsqueda */}
        <div className="lg:col-span-3">
          <div 
            className="inline-grid gap-1 select-none bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 rounded-xl border-2 border-gray-200 max-w-full overflow-x-auto"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleTouchMove}
          >
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map((cell, colIndex) => {
                  const cellKey = `${rowIndex},${colIndex}`;
                  const isSelected = selectedCells.has(cellKey);
                  const isFound = foundCells.has(cellKey);
                  
                  return (
                    <div
                      key={colIndex}
                      data-cell={`${rowIndex},${colIndex}`}
                      className={`
                        w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs sm:text-sm
                        rounded cursor-pointer transition-all touch-none
                        ${isFound 
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md scale-105 border-2 border-green-500' 
                          : isSelected 
                            ? 'bg-yellow-300 scale-110 shadow-lg border-2 border-yellow-500' 
                            : 'bg-white hover:bg-gray-100 border border-gray-300'
                        }
                      `}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                      onTouchStart={(e) => handleTouchStart(rowIndex, colIndex, e)}
                    >
                      {cell}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 <span className="hidden sm:inline">Arrastra el mouse</span><span className="sm:hidden">Desliza tu dedo</span> para seleccionar palabras (horizontal, vertical o diagonal)
          </p>
        </div>

        {/* Lista de palabras */}
        <div className="lg:col-span-2">
          <h4 className="font-bold text-gray-900 mb-3 text-lg">
            Palabras a encontrar:
          </h4>
          <div className="space-y-2">
            {words.map((word, index) => {
              const found = foundWords.has(word);
              return (
                <div
                  key={index}
                  className={`
                    px-4 py-2.5 rounded-lg font-semibold transition-all
                    ${found 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 shadow-md' 
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className={found ? 'line-through' : ''}>
                      {found && '✓ '}{word}
                    </span>
                    {found && <span className="text-xs font-bold text-green-700">+{POINTS_PER_WORD}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {foundWords.size === words.length && (
            <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl text-center shadow-lg">
              <p className="text-4xl mb-2">🎉</p>
              <p className="font-bold text-green-800 text-lg mb-1">
                ¡Completaste el juego!
              </p>
              <p className="text-sm text-green-700 mb-3">
                Puntuación final: <span className="font-bold text-2xl">{score}</span>
              </p>
              <button
                onClick={generateGrid}
                className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Jugar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
