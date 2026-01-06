// app/components/Hangman.tsx
"use client";

import { useState, useEffect } from 'react';

interface HangmanProps {
  category: 'obstetricia' | 'ginecologia' | 'lactancia' | 'neonatologia';
}

const WORD_DEFINITIONS = {
  obstetricia: [
    // Básicas (5-7 letras)
    { word: 'PARTO', hint: 'Proceso fisiológico de nacimiento' },
    { word: 'FETO', hint: 'Bebé en desarrollo dentro del útero' },
    { word: 'AMNIOS', hint: 'Membrana que rodea y protege al feto' },
    { word: 'PELVIS', hint: 'Estructura ósea por donde pasa el feto durante el parto' },
    { word: 'CERVIX', hint: 'Parte inferior del útero que se dilata en el parto' },
    { word: 'CORDON', hint: 'Une al feto con la placenta' },
    // Intermedias (8-10 letras)
    { word: 'CESAREA', hint: 'Procedimiento quirúrgico para extraer al bebé del útero' },
    { word: 'PLACENTA', hint: 'Órgano que permite el intercambio de nutrientes entre madre y feto' },
    { word: 'PRENATAL', hint: 'Control médico antes del nacimiento' },
    { word: 'EMBARAZO', hint: 'Período de gestación de la mujer' },
    { word: 'GESTACION', hint: 'Desarrollo del feto en el útero materno' },
    // Avanzadas (11+ letras)
    { word: 'PREECLAMPSIA', hint: 'Hipertensión durante el embarazo con proteinuria' },
    { word: 'OLIGOHIDRAMNIOS', hint: 'Disminución del líquido amniótico' },
    { word: 'POLIHIDRAMNIOS', hint: 'Exceso de líquido amniótico' },
    { word: 'AMNIOCENTESIS', hint: 'Punción del saco amniótico para diagnóstico prenatal' },
    { word: 'EPISIOTOMIA', hint: 'Incisión quirúrgica del perineo durante el parto' },
  ],
  ginecologia: [
    // Básicas (5-7 letras)
    { word: 'OVARIO', hint: 'Órgano que produce óvulos y hormonas femeninas' },
    { word: 'VAGINA', hint: 'Canal que conecta el útero con el exterior' },
    { word: 'MATRIZ', hint: 'Otro nombre del útero' },
    { word: 'MIOMA', hint: 'Tumor benigno del músculo uterino' },
    { word: 'QUISTE', hint: 'Saco lleno de líquido que puede formarse en el ovario' },
    { word: 'CICLO', hint: 'Período menstrual regular de la mujer' },
    // Intermedias (8-10 letras)
    { word: 'ENDOMETRIO', hint: 'Capa interna del útero que se descama en la menstruación' },
    { word: 'CISTOCELE', hint: 'Prolapso de la vejiga hacia la vagina' },
    { word: 'MENOPAUSIA', hint: 'Cese permanente de la menstruación' },
    { word: 'OVULACION', hint: 'Liberación del óvulo maduro del ovario' },
    // Avanzadas (11+ letras)
    { word: 'COLPOSCOPIA', hint: 'Examen visual del cuello uterino con colposcopio' },
    { word: 'HISTERECTOMIA', hint: 'Extirpación quirúrgica del útero' },
    { word: 'ENDOMETRIOSIS', hint: 'Crecimiento de tejido endometrial fuera del útero' },
    { word: 'SALPINGOCLASIA', hint: 'Esterilización tubárica bilateral' },
    { word: 'ANTICONCEPCION', hint: 'Métodos para prevenir el embarazo' },
  ],
  lactancia: [
    // Básicas (5-7 letras)
    { word: 'APEGO', hint: 'Vínculo inmediato entre madre y recién nacido' },
    { word: 'PECHO', hint: 'Glándula mamaria que produce leche' },
    { word: 'PEZON', hint: 'Estructura por donde sale la leche materna' },
    { word: 'LECHE', hint: 'Alimento natural del recién nacido' },
    { word: 'AREOLA', hint: 'Zona pigmentada alrededor del pezón' },
    // Intermedias (8-10 letras)
    { word: 'CALOSTRO', hint: 'Primera leche rica en anticuerpos' },
    { word: 'SUCCION', hint: 'Acción del bebé para extraer leche' },
    { word: 'REFLEJO', hint: 'Respuesta automática del bebé para alimentarse' },
    { word: 'NUTRICION', hint: 'Alimentación óptima del recién nacido' },
    { word: 'MASTITIS', hint: 'Inflamación dolorosa de la glándula mamaria' },
    { word: 'DESTETE', hint: 'Proceso de dejar de amamantar' },
    { word: 'EXTRACCION', hint: 'Obtención de leche materna con bomba o manual' },
    // Avanzadas (11+ letras)
    { word: 'LACTANCIA', hint: 'Período de alimentación con leche materna' },
    { word: 'PROLACTINA', hint: 'Hormona que estimula la producción de leche' },
    { word: 'HIPOGALACTIA', hint: 'Producción insuficiente de leche materna' },
  ],
  neonatologia: [
    // Básicas (5-7 letras)
    { word: 'APGAR', hint: 'Escala que evalúa al recién nacido al minuto 1 y 5' },
    { word: 'PESO', hint: 'Medida importante al nacer (normal 2500-4000g)' },
    { word: 'TALLA', hint: 'Longitud del recién nacido (normal 48-52 cm)' },
    { word: 'LLANTO', hint: 'Primera manifestación vocal del recién nacido' },
    { word: 'VERNIX', hint: 'Sustancia blanca que cubre al recién nacido' },
    { word: 'HIPOXIA', hint: 'Déficit de oxígeno en el recién nacido' },
    // Intermedias (8-10 letras)
    { word: 'NEONATO', hint: 'Bebé desde el nacimiento hasta los 28 días' },
    { word: 'REFLEJO', hint: 'Respuesta automática del recién nacido' },
    { word: 'FONTANELA', hint: 'Espacio membranoso entre huesos del cráneo' },
    { word: 'ICTERICIA', hint: 'Coloración amarillenta de la piel por bilirrubina' },
    { word: 'PREMATURO', hint: 'Recién nacido antes de las 37 semanas' },
    { word: 'CIANOSIS', hint: 'Coloración azulada por falta de oxígeno' },
    // Avanzadas (11+ letras)
    { word: 'FOTOTERAPIA', hint: 'Tratamiento con luz para la hiperbilirrubinemia' },
    { word: 'HIPOGLICEMIA', hint: 'Niveles bajos de glucosa en sangre neonatal' },
    { word: 'REANIMACION', hint: 'Maniobras para estabilizar al recién nacido' },
    { word: 'KERNICTERUS', hint: 'Daño cerebral por bilirrubina muy elevada' },
  ]
};

const MAX_ERRORS = 6;
const BASE_POINTS = 50;
const LETTER_PENALTY = 5;

export default function Hangman({ category }: HangmanProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [currentHint, setCurrentHint] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    startNewGame();
  }, [category]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/game-stats?gameType=hangman');
      if (response.ok) {
        const data = await response.json();
        if (data.stats) {
          setTotalScore(data.stats.totalScore || 0);
          setGamesPlayed(data.stats.gamesPlayed || 0);
          setGamesWon(data.stats.gamesWon || 0);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveStats = async (won: boolean, gameScore: number) => {
    try {
      await fetch('/api/game-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'hangman',
          won,
          score: gameScore,
        }),
      });
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  };

  const startNewGame = () => {
    const wordList = WORD_DEFINITIONS[category];
    const randomItem = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(randomItem.word);
    setCurrentHint(randomItem.hint);
    setGuessedLetters(new Set());
    setErrors(0);
    setGameStatus('playing');
    setScore(BASE_POINTS);
  };

  const handleLetterClick = async (letter: string) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!currentWord.includes(letter)) {
      const newErrors = errors + 1;
      setErrors(newErrors);
      const newScore = Math.max(0, score - LETTER_PENALTY);
      setScore(newScore);
      
      if (newErrors >= MAX_ERRORS) {
        setGameStatus('lost');
        const newGamesPlayed = gamesPlayed + 1;
        setGamesPlayed(newGamesPlayed);
        await saveStats(false, newScore);
      }
    } else {
      // Verificar si ganó
      const allLettersGuessed = currentWord.split('').every(l => 
        newGuessed.has(l) || l === ' '
      );
      if (allLettersGuessed) {
        setGameStatus('won');
        const newGamesPlayed = gamesPlayed + 1;
        const newGamesWon = gamesWon + 1;
        const newTotalScore = totalScore + score;
        setGamesPlayed(newGamesPlayed);
        setGamesWon(newGamesWon);
        setTotalScore(newTotalScore);
        await saveStats(true, score);
      }
    }
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

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const renderWord = () => {
    return currentWord.split('').map((letter, index) => {
      const isGuessed = guessedLetters.has(letter);
      const isSpace = letter === ' ';
      
      return (
        <div
          key={index}
          className={`
            w-10 h-12 md:w-12 md:h-14 flex items-center justify-center text-2xl font-bold
            border-b-4 mx-1
            ${isSpace ? 'border-transparent' : 'border-gray-400'}
            ${isGuessed || gameStatus !== 'playing' ? 'text-gray-900' : 'text-transparent'}
          `}
        >
          {isSpace ? '' : (gameStatus !== 'playing' || isGuessed ? letter : '?')}
        </div>
      );
    });
  };

  const renderHangman = () => {
    const parts = [
      // Cabeza
      <circle key="head" cx="60" cy="25" r="10" className="stroke-red-600 fill-none stroke-[3]" />,
      // Cuerpo
      <line key="body" x1="60" y1="35" x2="60" y2="55" className="stroke-red-600 stroke-[3]" />,
      // Brazo izquierdo
      <line key="leftarm" x1="60" y1="40" x2="50" y2="45" className="stroke-red-600 stroke-[3]" />,
      // Brazo derecho
      <line key="rightarm" x1="60" y1="40" x2="70" y2="45" className="stroke-red-600 stroke-[3]" />,
      // Pierna izquierda
      <line key="leftleg" x1="60" y1="55" x2="50" y2="65" className="stroke-red-600 stroke-[3]" />,
      // Pierna derecha
      <line key="rightleg" x1="60" y1="55" x2="70" y2="65" className="stroke-red-600 stroke-[3]" />,
    ];

    return (
      <svg width="100" height="80" viewBox="0 0 100 80" className="mx-auto">
        {/* Base */}
        <line x1="10" y1="75" x2="50" y2="75" className="stroke-gray-700 stroke-[3]" />
        {/* Poste vertical */}
        <line x1="20" y1="75" x2="20" y2="5" className="stroke-gray-700 stroke-[3]" />
        {/* Poste horizontal */}
        <line x1="20" y1="5" x2="60" y2="5" className="stroke-gray-700 stroke-[3]" />
        {/* Cuerda */}
        <line x1="60" y1="5" x2="60" y2="15" className="stroke-gray-700 stroke-[3]" />
        
        {/* Partes del cuerpo según errores */}
        {parts.slice(0, errors)}
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              🎮 Ahorcado Matronil
            </h3>
            <p className="text-sm text-gray-600">
              Tema: <span className="font-bold text-gray-900">{getCategoryTitle()}</span>
            </p>
          </div>
          <button
            onClick={startNewGame}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105"
          >
            🔄 Nueva Palabra
          </button>
        </div>

        {/* Sistema de puntos */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 border-2 border-yellow-200 text-center">
            <p className="text-xs text-gray-600 font-medium mb-1">Puntos Actuales</p>
            <p className="text-xl font-bold text-yellow-700">{score}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border-2 border-blue-200 text-center">
            <p className="text-xs text-gray-600 font-medium mb-1">Total</p>
            <p className="text-xl font-bold text-blue-700">{totalScore}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200 text-center">
            <p className="text-xs text-gray-600 font-medium mb-1">Ganadas</p>
            <p className="text-xl font-bold text-green-700">{gamesWon}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border-2 border-purple-200 text-center">
            <p className="text-xs text-gray-600 font-medium mb-1">Jugadas</p>
            <p className="text-xl font-bold text-purple-700">{gamesPlayed}</p>
          </div>
        </div>

        {/* Contador de errores */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-700">Vidas restantes:</span>
          <div className="flex gap-1">
            {Array.from({length: MAX_ERRORS}).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-bold text-lg
                  ${i < errors 
                    ? 'bg-red-100 border-red-400 text-red-700' 
                    : 'bg-green-100 border-green-400 text-green-700'
                  }`}
              >
                {i < errors ? '💀' : '❤️'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dibujo del ahorcado */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border-2 border-gray-200">
        {renderHangman()}
      </div>

      {/* Pista */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-blue-900 mb-1">💡 Pista:</p>
        <p className="text-blue-800">{currentHint}</p>
      </div>

      {/* Palabra a adivinar */}
      <div className="flex flex-wrap justify-center mb-6">
        {renderWord()}
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 mb-6">
        {alphabet.map(letter => {
          const isGuessed = guessedLetters.has(letter);
          const isCorrect = isGuessed && currentWord.includes(letter);
          const isWrong = isGuessed && !currentWord.includes(letter);
          
          return (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={gameStatus !== 'playing' || isGuessed}
              className={`
                h-10 rounded-lg font-bold text-sm transition-all
                ${isCorrect ? 'bg-green-500 text-white border-green-600' : ''}
                ${isWrong ? 'bg-red-500 text-white border-red-600' : ''}
                ${!isGuessed && gameStatus === 'playing' ? 'bg-white border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:scale-110' : ''}
                ${gameStatus !== 'playing' || isGuessed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Mensaje de victoria/derrota */}
      {gameStatus === 'won' && (
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl text-center shadow-lg">
          <p className="text-5xl mb-3">🎉</p>
          <p className="text-2xl font-bold text-green-800 mb-2">
            ¡Excelente! Adivinaste la palabra
          </p>
          <p className="text-green-700 mb-2">
            <span className="font-bold text-xl">{currentWord}</span>
          </p>
          <p className="text-sm text-green-600 mb-4">{currentHint}</p>
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Ganaste</p>
            <p className="text-3xl font-bold text-green-600">+{score} puntos</p>
          </div>
          <button
            onClick={startNewGame}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            Siguiente palabra →
          </button>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl text-center shadow-lg">
          <p className="text-5xl mb-3">😔</p>
          <p className="text-2xl font-bold text-red-800 mb-2">
            Juego terminado
          </p>
          <p className="text-red-700 mb-2">
            La palabra era: <span className="font-bold text-xl">{currentWord}</span>
          </p>
          <p className="text-sm text-red-600 mb-4">{currentHint}</p>
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Aprendiste algo nuevo</p>
            <p className="text-lg font-bold text-gray-700">¡Sigue practicando! 💪</p>
          </div>
          <button
            onClick={startNewGame}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            Intentar de nuevo →
          </button>
        </div>
      )}
    </div>
  );
}
