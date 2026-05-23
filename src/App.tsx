import { useState, useEffect, useRef } from 'react';
import { SudokuGenerator } from './utils/sudoku';
import type { Difficulty } from './utils/sudoku';

// ==========================================================================
// PROGRAMMATIC 8-BIT CHIPTUNE SYNTHESIZER (Web Audio API)
// ==========================================================================
class ChiptuneSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSelect() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle'; // classic chiptune triangle wave
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playPlace() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine'; // bubble pop sound
    osc.frequency.setValueAtTime(550, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playError() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth'; // 8-bit retro buzz
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playHint() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playLineComplete() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 arpeggio
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      
      gain.gain.setValueAtTime(0.05, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.18);
    });
  }

  public playVictory() {
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    // Triumphant 8-bit arpeggio
    const notes = [
      { f: 261.63, d: 0.08 }, // C4
      { f: 329.63, d: 0.08 }, // E4
      { f: 392.00, d: 0.08 }, // G4
      { f: 523.25, d: 0.12 }, // C5
      { f: 392.00, d: 0.08 }, // G4
      { f: 523.25, d: 0.08 }, // C5
      { f: 659.25, d: 0.08 }, // E5
      { f: 783.99, d: 0.4 },  // G5 (held)
    ];
    
    let timeOffset = 0;
    notes.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, now + timeOffset);
      
      gain.gain.setValueAtTime(0.08, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + note.d);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + note.d);
      
      timeOffset += note.d - 0.01;
    });
  }
}

const synth = new ChiptuneSynth();
const generator = new SudokuGenerator();

// Quest symbols map (1-9)
const QUEST_MAP: Record<number, string> = {
  1: '⚔️', // Sword
  2: '🛡️', // Shield
  3: '💎', // Gem
  4: '🧪', // Potion
  5: '🪙', // Coin
  6: '🔑', // Key
  7: '👑', // Crown
  8: '🔥', // Fireball
  9: '⭐'  // Star
};

type ThemeType = 'glass' | 'cyber' | 'retro';
type GameModeType = 'numbers' | 'quest';

function App() {
  // Game States
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [userGrid, setUserGrid] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  
  // Game Customizations
  const [theme, setTheme] = useState<ThemeType>('cyber'); // Default to Cyberpunk Neon (ages 8+)
  const [gameMode, setGameMode] = useState<GameModeType>('numbers');
  const [showSolution, setShowSolution] = useState(false);
  
  // Stats & Progress
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [mistakesMade, setMistakesMade] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'victory' | 'gameover'>('playing');
  const [errorFlash, setErrorFlash] = useState(false);

  // Sparkles on win
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number }[]>([]);

  // Time tracker ref
  const timerIntervalRef = useRef<any>(null);

  // Generate a new puzzle
  const generateNewGame = (diff: Difficulty = difficulty) => {
    setIsGenerating(true);
    setShowSolution(false);
    setSelectedCell(null);
    setLives(3);
    setTimer(0);
    setIsPaused(false);
    setHintsUsed(0);
    setMistakesMade(0);
    setGameStatus('playing');

    setTimeout(() => {
      const { puzzle: newPuzzle, solution: newSolution } = generator.generate(diff);
      setPuzzle(newPuzzle);
      // userGrid is a deep copy of the puzzle grid
      setUserGrid(newPuzzle.map(row => [...row]));
      setSolution(newSolution);
      setDifficulty(diff);
      setIsGenerating(false);
    }, 120);
  };

  // On mount, trigger first game
  useEffect(() => {
    generateNewGame('Easy');
  }, []);

  // Timer Effect
  useEffect(() => {
    if (gameStatus === 'playing' && !isPaused && !isGenerating) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameStatus, isPaused, isGenerating]);

  // Keyboard navigation & inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing' || isPaused || isGenerating || !selectedCell) return;

      const { r, c } = selectedCell;

      // Arrow navigation
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        synth.playSelect();
        setSelectedCell({ r: r > 0 ? r - 1 : 8, c });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        synth.playSelect();
        setSelectedCell({ r: r < 8 ? r + 1 : 0, c });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        synth.playSelect();
        setSelectedCell({ r, c: c > 0 ? c - 1 : 8 });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        synth.playSelect();
        setSelectedCell({ r, c: c < 8 ? c + 1 : 0 });
      }

      // Input numbers 1-9
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 9) {
        handleCellValueInput(r, c, keyNum);
      }

      // Erase values
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        handleCellClear(r, c);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, gameStatus, isPaused, isGenerating, puzzle, userGrid, solution]);

  // Handle cell click
  const handleCellSelect = (r: number, c: number) => {
    if (gameStatus !== 'playing' || isPaused || isGenerating) return;
    synth.playSelect();
    setSelectedCell({ r, c });
  };

  // Clear cell
  const handleCellClear = (r: number, c: number) => {
    if (puzzle[r]?.[c] !== 0) return; // cannot clear initial clues
    synth.playPlace();
    const nextGrid = userGrid.map(row => [...row]);
    nextGrid[r][c] = 0;
    setUserGrid(nextGrid);
  };

  // Place number/symbol
  const handleCellValueInput = (r: number, c: number, value: number) => {
    if (puzzle[r]?.[c] !== 0) return; // clue cells are locked

    const nextGrid = userGrid.map(row => [...row]);
    nextGrid[r][c] = value;
    setUserGrid(nextGrid);

    // Validate if matching solution
    if (value === solution[r][c]) {
      synth.playPlace();
      
      // Check if a line (row, col) or block was completed correctly just now!
      checkGridCompletions(nextGrid, r, c);

      // Check if won
      if (checkWin(nextGrid)) {
        setGameStatus('victory');
        synth.playVictory();
        generateWinParticles();
      }
    } else {
      // Mistake!
      synth.playError();
      setMistakesMade(prev => prev + 1);
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 500);

      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setGameStatus('gameover');
      }
    }
  };

  // Check if current action completed any lines or blocks for visual reward
  const checkGridCompletions = (grid: number[][], r: number, c: number) => {
    let completed = false;

    // Check Row
    if (grid[r].every((val, colIdx) => val === solution[r][colIdx])) {
      completed = true;
    }
    // Check Col
    if (grid.every((rowVal, rowIdx) => rowVal[c] === solution[rowIdx][c])) {
      completed = true;
    }

    if (completed) {
      synth.playLineComplete();
    }
  };

  const checkWin = (gridToCheck: number[][]) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (gridToCheck[r][c] !== solution[r][c]) {
          return false;
        }
      }
    }
    return true;
  };

  // Generate victory particles
  const generateWinParticles = () => {
    const cols = ['#00ffcc', '#ff007f', '#ffff00', '#39ff14', '#8b5cf6', '#3b82f6'];
    const arr = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * 100 + 100, // offset below screen
      color: cols[Math.floor(Math.random() * cols.length)],
      size: Math.random() * 12 + 6,
      delay: Math.random() * 3
    }));
    setParticles(arr);
  };

  // Request interactive hint
  const triggerHint = () => {
    if (gameStatus !== 'playing' || isPaused || !selectedCell) return;
    const { r, c } = selectedCell;

    if (puzzle[r][c] !== 0) return; // already a clue

    synth.playHint();
    const correctVal = solution[r][c];
    const nextGrid = userGrid.map(row => [...row]);
    nextGrid[r][c] = correctVal;
    setUserGrid(nextGrid);
    setHintsUsed(prev => prev + 1);

    // If hint wins the game
    if (checkWin(nextGrid)) {
      setGameStatus('victory');
      synth.playVictory();
      generateWinParticles();
    }
  };

  // Formatting stopwatch time helper
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  // Toggle paused screen
  const togglePause = () => {
    synth.playSelect();
    setIsPaused(!isPaused);
  };

  // Calculate victory star rating
  const getStarCount = () => {
    if (mistakesMade === 0 && hintsUsed === 0 && timer < 600) return 3;
    if (mistakesMade <= 1 && hintsUsed <= 1 && timer < 900) return 2;
    return 1;
  };

  return (
    <div className={`min-h-screen py-6 px-4 print:bg-white print:p-0 print:m-0 theme-${theme} ${theme === 'retro' ? 'crt-overlay' : ''}`}>
      
      {/* ------------------------------------------------------------- */}
      {/* DIGITAL GAME DISPLAY */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-4xl mx-auto print:hidden">
        
        {/* Centered Premium KIDUKU Banner Header */}
        <header className="text-center mb-6 pt-2 select-none">
          <h1 className="text-6xl sm:text-7xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 font-fredoka drop-shadow-[0_4px_10px_rgba(99,102,241,0.35)] animate-float-slow inline-block">
            KIDUKU
          </h1>
        </header>

        {/* Sleek Top Game Control Panel */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 glass-panel px-6 py-4 rounded-3xl">
          
          {/* Rebranded Subtitle */}
          <div>
            <h2 className="text-sm font-extrabold tracking-widest uppercase opacity-85 text-indigo-400 font-mono">
              Kiduku
            </h2>
          </div>

          {/* Settings togglers */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* Mode Select */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => { synth.playSelect(); setGameMode('numbers'); }}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all touch-manipulation active:scale-95 ${
                  gameMode === 'numbers' ? 'bg-indigo-600 text-white shadow' : 'opacity-60 hover:opacity-100'
                }`}
              >
                🔢 Numbers
              </button>
              <button
                onClick={() => { synth.playSelect(); setGameMode('quest'); }}
                className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all touch-manipulation active:scale-95 ${
                  gameMode === 'quest' ? 'bg-indigo-600 text-white shadow' : 'opacity-60 hover:opacity-100'
                }`}
              >
                ⚔️ Quest Mode
              </button>
            </div>

            {/* Theme Select */}
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
              {(['glass', 'cyber', 'retro'] as ThemeType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { synth.playSelect(); setTheme(t); }}
                  className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-black capitalize transition-all touch-manipulation active:scale-95 ${
                    theme === t ? 'bg-indigo-600 text-white shadow' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {t === 'glass' && '🌐 Glass'}
                  {t === 'cyber' && '🧬 Cyber'}
                  {t === 'retro' && '🕹️ Retro'}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Dashboard Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 items-center gap-4 mb-6 glass-panel p-5 rounded-3xl text-center">
          
          {/* Difficulty display */}
          <div className="flex flex-col items-center justify-center border-r border-white/5 py-2">
            <span className="text-xs uppercase tracking-wider font-semibold opacity-60">Level</span>
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {(['Easy', 'Medium', 'Hard', 'Expert'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => generateNewGame(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all touch-manipulation active:scale-95 ${
                    difficulty === d
                      ? 'bg-amber-500 text-white shadow'
                      : 'bg-white/5 opacity-55 hover:opacity-100'
                  }`}
                  disabled={isGenerating}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Speed-run Timer */}
          <div className="flex flex-col items-center justify-center border-r border-white/5 py-2">
            <span className="text-xs uppercase tracking-wider font-semibold opacity-60">Timer</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-2xl font-bold tracking-widest text-indigo-400">
                {formatTime(timer)}
              </span>
              <button
                onClick={togglePause}
                className="p-1 rounded bg-black/10 hover:bg-black/30 border border-white/5 text-xs transition-colors"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? '▶️' : '⏸️'}
              </button>
            </div>
          </div>

          {/* Heart Container Lives */}
          <div className="flex flex-col items-center justify-center border-r border-white/5 py-2">
            <span className="text-xs uppercase tracking-wider font-semibold opacity-60">Shield / Lives</span>
            <div className="flex gap-1.5 mt-2 text-xl">
              {[1, 2, 3].map((heartIdx) => (
                <span
                  key={heartIdx}
                  className={`transition-all duration-300 transform ${
                    heartIdx <= lives
                      ? 'text-rose-500 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                      : 'text-white/20 scale-90 blur-[0.5px]'
                  }`}
                >
                  ❤️
                </span>
              ))}
            </div>
          </div>

          {/* Hints bulb count */}
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-xs uppercase tracking-wider font-semibold opacity-60">Game Help</span>
            <button
              onClick={triggerHint}
              disabled={!selectedCell || gameStatus !== 'playing' || isPaused}
              className={`mt-1.5 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedCell && gameStatus === 'playing'
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                  : 'opacity-30 cursor-not-allowed bg-white/5'
              }`}
            >
              💡 Hint ({hintsUsed})
            </button>
          </div>

        </div>

        {/* Main Sudoku Play Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          
          {/* Left Column: Sudoku Grid Container */}
          <div className="lg:col-span-8 flex justify-center">
            
            <div className={`relative w-full max-w-[560px] aspect-square p-3.5 rounded-3xl grid-container transition-all ${
              errorFlash ? 'grid-error-flash animate-shake' : ''
            }`}>
              
              {/* Overlay states (Generating / Paused / Game Over / Victory) */}
              
              {/* Generating screen */}
              {isGenerating && (
                <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center">
                  <div className="text-5xl animate-bounce mb-3">🧩</div>
                  <span className="font-mono text-xl font-bold tracking-widest text-cyan-400">LOADING LEVEL...</span>
                </div>
              )}

              {/* Paused screen overlay */}
              {isPaused && !isGenerating && (
                <button
                  onClick={togglePause}
                  className="absolute inset-0 z-20 bg-black/95 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center cursor-pointer group focus:outline-none"
                >
                  <div className="text-6xl text-cyan-400 animate-pulse group-hover:scale-110 transition-transform mb-4">
                    🎮
                  </div>
                  <span className="font-mono text-2xl font-bold tracking-widest text-indigo-300">GAME PAUSED</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/50 mt-2">Click anywhere to resume</span>
                </button>
              )}

              {/* Game Over screen overlay */}
              {gameStatus === 'gameover' && (
                <div className="absolute inset-0 z-20 bg-black/95 backdrop-blur-lg rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-6xl mb-4 animate-bounce">💀</div>
                  <h2 className="text-3xl font-black text-rose-500 tracking-wider font-fredoka uppercase">Game Over</h2>
                  <p className="text-sm text-white/60 mt-2 max-w-[280px]">
                    You ran out of shield charges! Logic puzzles require patience.
                  </p>
                  <button
                    onClick={() => generateNewGame()}
                    className="mt-6 px-6 py-3 bg-rose-500 text-white text-md font-bold rounded-2xl hover:bg-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.4)] btn-tactile"
                  >
                    🔄 Try Again
                  </button>
                </div>
              )}

              {/* Victory screen overlay */}
              {gameStatus === 'victory' && (
                <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  
                  {/* CSS Falling Particles */}
                  {particles.map(p => (
                    <div
                      key={p.id}
                      className="absolute rounded-full opacity-70 animate-float-slow"
                      style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        left: `${p.x}%`,
                        top: `-${p.size}px`,
                        animation: `shimmer-sweep 2.5s ease-in-out infinite`,
                        animationDelay: `${p.delay}s`
                      }}
                    />
                  ))}

                  <div className="text-6xl mb-2 animate-bounce">🏆</div>
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 tracking-widest font-fredoka uppercase">
                    VICTORY!
                  </h2>
                  <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mt-1">Level Cleared</p>
                  
                  {/* Star Achievements */}
                  <div className="flex gap-2 my-4 text-3xl justify-center">
                    {[1, 2, 3].map((starIdx) => (
                      <span
                        key={starIdx}
                        className={`transition-all transform ${
                          starIdx <= getStarCount()
                            ? 'text-yellow-400 scale-110 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)] animate-pulse'
                            : 'text-white/10 scale-90'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>

                  {/* Summary Details */}
                  <div className="grid grid-cols-3 bg-white/5 border border-white/10 rounded-2xl p-4 gap-4 w-full max-w-[320px] mb-6">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-white/50">Time</span>
                      <span className="font-mono font-bold text-lg text-white">{formatTime(timer)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-white/50">Mistakes</span>
                      <span className="font-mono font-bold text-lg text-rose-400">{mistakesMade}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-white/50">Hints</span>
                      <span className="font-mono font-bold text-lg text-amber-400">{hintsUsed}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => generateNewGame()}
                    className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-lg font-black rounded-2xl hover:from-amber-400 hover:to-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)] btn-tactile"
                  >
                    🎮 Play Next Level
                  </button>
                </div>
              )}

              {/* 9x9 Grid Layout */}
              <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-full h-full bg-transparent">
                {[0, 1, 2].map((blockRow) => (
                  [0, 1, 2].map((blockCol) => (
                    <div key={`${blockRow}-${blockCol}`} className="grid grid-cols-3 grid-rows-3 bg-black/10 rounded-xl overflow-hidden gap-[1px]">
                      {[0, 1, 2].map((row) => (
                        [0, 1, 2].map((col) => {
                          const r = blockRow * 3 + row;
                          const c = blockCol * 3 + col;
                          const isClue = puzzle[r]?.[c] !== 0;
                          
                          // Active value checks
                          const activeVal = userGrid[r]?.[c];
                          const displayVal = showSolution ? solution[r]?.[c] : activeVal;
                          
                          // Check if cell is wrong compared to solution
                          const isWrong = activeVal !== 0 && activeVal !== solution[r]?.[c];

                          // Selection highlight calculations
                          const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;
                          const isSameRow = selectedCell && selectedCell.r === r;
                          const isSameCol = selectedCell && selectedCell.c === c;
                          const isSameBlock = selectedCell &&
                            Math.floor(selectedCell.r / 3) === blockRow &&
                            Math.floor(selectedCell.c / 3) === blockCol;
                          
                          // Identical matching numbers highlight
                          const selectedVal = selectedCell ? userGrid[selectedCell.r]?.[selectedCell.c] : 0;
                          const isMatchingVal = selectedVal !== 0 && activeVal === selectedVal;

                          return (
                            <button
                              key={`${r}-${c}`}
                              onClick={() => handleCellSelect(r, c)}
                              className={`
                                flex items-center justify-center font-black text-2xl md:text-3xl focus:outline-none transition-all touch-manipulation active:scale-95 duration-100
                                ${isClue ? 'grid-cell-clue' : 'grid-cell-empty'}
                                ${isSelected ? 'cell-selected scale-[0.98]' : ''}
                                ${!isSelected && (isSameRow || isSameCol || isSameBlock) ? 'cell-highlight' : ''}
                                ${isMatchingVal && !isSelected ? 'ring-2 ring-indigo-500/50 bg-indigo-500/10' : ''}
                                ${isWrong ? 'text-rose-500 border-rose-500 bg-rose-500/10 ring-2 ring-rose-500' : ''}
                                ${!isClue && activeVal !== 0 && !isWrong ? 'animate-pop' : ''}
                              `}
                              style={{ aspectRatio: '1/1' }}
                            >
                              {displayVal !== 0 ? (
                                gameMode === 'quest' ? (
                                  <span className="text-xl md:text-2xl drop-shadow">{QUEST_MAP[displayVal]}</span>
                                ) : (
                                  displayVal
                                )
                              ) : ''}
                            </button>
                          );
                        })
                      ))}
                    </div>
                  ))
                ))}
              </div>

            </div>
          </div>

          {/* Right Column: Tactile Arcade Controls */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* floating controls board */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col gap-5 text-center">
              
              <div>
                <h3 className="text-md font-bold uppercase tracking-widest opacity-80">
                  {gameMode === 'quest' ? 'Quest Pack ⚔️' : 'Arcade Keypad 🔢'}
                </h3>
                <p className="text-[11px] opacity-60 mt-1">Select a box above, then click a button to place!</p>
              </div>

              {/* Grid of Keypad Input Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }, (_, i) => i + 1).map((val) => {
                  return (
                    <button
                      key={val}
                      onClick={() => selectedCell && handleCellValueInput(selectedCell.r, selectedCell.c, val)}
                      disabled={!selectedCell || gameStatus !== 'playing' || isPaused}
                      className={`
                        py-5 px-3 md:py-6 md:px-4 rounded-2xl font-black text-2xl md:text-3xl flex flex-col items-center justify-center transition-all btn-tactile touch-manipulation active:scale-95
                        ${selectedCell 
                          ? 'bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600 text-white' 
                          : 'opacity-30 cursor-not-allowed bg-black/10'
                        }
                      `}
                    >
                      {gameMode === 'quest' ? (
                        <>
                          <span className="text-3xl">{QUEST_MAP[val]}</span>
                          <span className="text-[9px] font-mono opacity-50 font-normal mt-0.5">#{val}</span>
                        </>
                      ) : (
                        val
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Utility row (Clear cell, Toggle Answer) */}
              <div className="flex gap-3">
                
                <button
                  onClick={() => selectedCell && handleCellClear(selectedCell.r, selectedCell.c)}
                  disabled={!selectedCell || gameStatus !== 'playing' || isPaused}
                  className="flex-1 py-4 md:py-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-bold text-sm md:text-base hover:bg-red-500 hover:text-white transition-all btn-tactile disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                >
                  🧹 Clear Cell
                </button>

                <button
                  onClick={() => { synth.playSelect(); generateNewGame(); }}
                  className="flex-1 py-4 md:py-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-bold text-sm md:text-base hover:bg-emerald-500 hover:text-white transition-all btn-tactile touch-manipulation"
                >
                  🔄 Reset Game
                </button>

              </div>

            </div>

            {/* Quick action utility shortcuts */}
            <div className="flex flex-col gap-3">
              
              <button
                onClick={handlePrint}
                className="w-full py-4 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/20 hover:text-white text-cyan-400 font-bold rounded-2xl transition-all btn-tactile text-sm md:text-base flex items-center justify-center gap-2 touch-manipulation"
              >
                🖨️ Generate Printable Worksheet
              </button>

              <button
                onClick={() => { synth.playSelect(); setShowSolution(!showSolution); }}
                className={`w-full py-4 border rounded-2xl font-bold transition-all btn-tactile text-sm md:text-base flex items-center justify-center gap-2 touch-manipulation ${
                  showSolution
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-indigo-600/10 hover:bg-indigo-600 border-indigo-500/20 hover:text-white text-indigo-400'
                }`}
              >
                {showSolution ? '🙈 Hide Complete Board' : '💡 Peek Complete Board'}
              </button>

            </div>

          </div>

        </div>

        {/* Global Footer */}
        <footer className="mt-12 py-6 border-t border-white/5 text-center text-xs opacity-50 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span>Version 0.2.0 (8+ Arcade Edition)</span>
            <span>•</span>
            <span>Vibe-Coded by Patrick Kajirian</span>
          </div>
          <p>Controls: Use Mouse clicks, Keyboard Numbers (1-9), Erase (Backspace), and Navigation (Arrows).</p>
        </footer>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* PRINT-ONLY VIEW (Highly Crisp High-contrast Worksheet) */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden print:block w-full max-w-[190mm] mx-auto bg-white text-black font-sans p-6 box-border">
        
        {/* Printable Header */}
        <div className="flex justify-between items-end border-b-4 border-black pb-4">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tight m-0 p-0 leading-none">KIDUKU</h1>
            <p className="text-lg font-bold mt-1 text-gray-700">Arcade Sudoku Challenge // Level: <span className="uppercase">{difficulty}</span></p>
          </div>
          <div className="text-right flex flex-col gap-2 w-72">
            <div className="flex items-end border-b-2 border-black pb-0.5">
              <span className="font-bold text-sm mr-2 text-gray-600">Player Name:</span>
              <div className="flex-1"></div>
            </div>
            <div className="flex items-end border-b-2 border-black pb-0.5">
              <span className="font-bold text-sm mr-2 text-gray-600">Completion Date:</span>
              <div className="flex-1"></div>
            </div>
          </div>
        </div>

        {/* Crisp Printable 9x9 grid */}
        <div className="my-10 flex justify-center">
          <div className="w-[140mm] h-[140mm] border-4 border-black box-border flex flex-col bg-white">
            {[0, 1, 2].map((blockRow) => (
              <div key={`p-brow-${blockRow}`} className="flex-1 flex border-b-4 border-black last:border-b-0">
                {[0, 1, 2].map((blockCol) => (
                  <div key={`p-bcol-${blockCol}`} className="flex-1 flex flex-col border-r-4 border-black last:border-r-0">
                    {[0, 1, 2].map((row) => (
                      <div key={`p-row-${row}`} className="flex-1 flex border-b-[1px] border-black last:border-b-0">
                        {[0, 1, 2].map((col) => {
                          const r = blockRow * 3 + row;
                          const c = blockCol * 3 + col;
                          const isClue = puzzle[r]?.[c] !== 0;
                          
                          // In printout, if answer is shown, overlay it, else draw user current inputs
                          const displayVal = showSolution ? solution[r]?.[c] : userGrid[r]?.[c];
                          
                          return (
                            <div
                              key={`p-${r}-${c}`}
                              className={`flex-1 flex items-center justify-center border-r-[1px] border-black last:border-r-0 text-3xl font-black
                                ${!isClue && showSolution ? 'text-gray-400 italic bg-gray-50' : 'text-black bg-white'}
                              `}
                            >
                              {displayVal !== 0 ? displayVal : ''}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Printable Footer */}
        <div className="text-center border-t-2 border-black pt-4 mt-6">
          <p className="text-sm font-bold">Good luck! Use logical deduction to solve the level. Every cell has only one correct answer.</p>
          <p className="text-[10px] text-gray-500 mt-2">Worksheet generated automatically by Kiduku Arcade Engine. Printed in high-contrast numbers mode.</p>
        </div>
      </div>

    </div>
  );
}

export default App;
