import { useState, useEffect } from 'react';
import { SudokuGenerator } from './utils/sudoku';
import type { Difficulty } from './utils/sudoku';

const generator = new SudokuGenerator();

function App() {
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const generateNewGame = (diff: Difficulty = difficulty) => {
    setIsGenerating(true);
    setShowSolution(false);
    // Timeout to allow UI to show "Generating" state
    setTimeout(() => {
      const { puzzle: newPuzzle, solution: newSolution } = generator.generate(diff);
      setPuzzle(newPuzzle);
      setSolution(newSolution);
      setDifficulty(diff);
      setIsGenerating(false);
    }, 100);
  };

  useEffect(() => {
    generateNewGame('Easy');
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const toggleSolution = () => {
    setShowSolution(!showSolution);
  };

  return (
    <div className="min-h-screen bg-sky-100 py-10 px-4 font-sans text-slate-800 print:bg-white print:p-0 print:m-0">
      
      {/* Screen UI Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_0_rgb(186,230,253)] p-8 sm:p-12 border-4 border-sky-200 print:hidden">
        
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-6xl sm:text-7xl font-black text-amber-400 drop-shadow-[0_4px_0_rgb(217,119,6)] tracking-wide mb-4">
            KIDOKU
          </h1>
          <p className="text-2xl font-bold text-sky-600 bg-sky-50 inline-block px-6 py-2 rounded-full">
            Let's Play Sudoku! 🧩
          </p>
        </header>

        {/* Difficulty Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {(['Easy', 'Medium', 'Hard', 'Expert'] as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => generateNewGame(level)}
              className={`px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-xl transition-all transform active:translate-y-2 active:shadow-none ${
                difficulty === level
                  ? 'bg-sky-400 text-white shadow-[0_6px_0_rgb(2,132,199)] translate-y-1'
                  : 'bg-slate-100 text-slate-500 hover:bg-sky-50 shadow-[0_6px_0_rgb(203,213,225)] hover:text-sky-500'
              }`}
              disabled={isGenerating}
            >
              {level === 'Easy' && '🐥 Easy'}
              {level === 'Medium' && '🦊 Medium'}
              {level === 'Hard' && '🦁 Hard'}
              {level === 'Expert' && '🦄 Expert'}
            </button>
          ))}
        </div>

        {/* Screen Sudoku Grid */}
        <div className="relative bg-slate-800 p-2 sm:p-3 rounded-3xl max-w-[500px] mx-auto shadow-inner">
          <div className="grid grid-cols-3 grid-rows-3 gap-1.5 sm:gap-2 w-full aspect-square bg-slate-800">
            {isGenerating && (
              <div className="absolute inset-0 z-10 bg-white/95 rounded-2xl flex flex-col items-center justify-center">
                <div className="animate-spin text-6xl mb-4">🧩</div>
                <span className="font-black text-2xl text-sky-500 tracking-wider">THINKING...</span>
              </div>
            )}
            
            {[0, 1, 2].map((blockRow) => (
              [0, 1, 2].map((blockCol) => (
                <div key={`${blockRow}-${blockCol}`} className="grid grid-cols-3 grid-rows-3 bg-white rounded-xl overflow-hidden shadow-sm">
                  {[0, 1, 2].map((row) => (
                    [0, 1, 2].map((col) => {
                      const r = blockRow * 3 + row;
                      const c = blockCol * 3 + col;
                      const isClue = puzzle[r]?.[c] !== 0;
                      const displayVal = showSolution ? solution[r]?.[c] : puzzle[r]?.[c];
                      
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`
                            border-[1px] border-slate-100 flex items-center justify-center text-3xl sm:text-4xl font-black
                            ${isClue ? 'text-slate-800' : 'text-emerald-500 bg-emerald-50'}
                            ${!isClue && showSolution ? 'scale-110 transition-transform' : ''}
                          `}
                        >
                          {displayVal !== 0 ? displayVal : ''}
                        </div>
                      );
                    })
                  ))}
                </div>
              ))
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
          <button
            onClick={() => generateNewGame()}
            className="px-8 py-5 bg-rose-400 text-white rounded-[2rem] font-black text-2xl hover:bg-rose-500 transition-all shadow-[0_8px_0_rgb(225,29,72)] active:shadow-none active:translate-y-2 flex-1 max-w-[250px]"
            disabled={isGenerating}
          >
            🔄 New Game
          </button>
          
          <button
            onClick={toggleSolution}
            className={`px-8 py-5 rounded-[2rem] font-black text-2xl transition-all active:shadow-none active:translate-y-2 flex-1 max-w-[250px] ${
              showSolution 
                ? 'bg-amber-400 text-white shadow-[0_8px_0_rgb(217,119,6)] hover:bg-amber-500' 
                : 'bg-emerald-400 text-white shadow-[0_8px_0_rgb(5,150,105)] hover:bg-emerald-500'
            }`}
            disabled={isGenerating}
          >
            {showSolution ? '🙈 Hide' : '💡 Answer'}
          </button>

          <button
            onClick={handlePrint}
            className="px-8 py-5 bg-indigo-400 text-white rounded-[2rem] font-black text-2xl hover:bg-indigo-500 transition-all shadow-[0_8px_0_rgb(79,70,229)] active:shadow-none active:translate-y-2 flex-1 max-w-[250px]"
            disabled={isGenerating}
          >
            🖨️ Print
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-slate-50 text-center text-slate-400 font-bold">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 opacity-60">Version 0.1.0</p>
          <p className="text-lg">
            Vibe-Coded by{" "}
            <a 
              href="mailto:patrickkajirian@gmail.com" 
              className="text-sky-400 hover:text-sky-500 transition-colors hover:underline decoration-2 underline-offset-4"
            >
              Patrick Kajirian
            </a>
          </p>
        </footer>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PRINT ONLY VIEW - Optimized for Black & White Worksheets */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden print:block w-full max-w-[190mm] mx-auto bg-white text-black font-sans p-12 box-border">
        
        {/* Worksheet Header */}
        <div className="flex justify-between items-end border-b-4 border-black pb-6 mb-6">
          <div>
            <h1 className="text-6xl font-black uppercase tracking-tight m-0 p-0 leading-none">KIDOKU</h1>
            <p className="text-2xl font-bold mt-2">Level: <span className="uppercase">{difficulty}</span></p>
          </div>
          <div className="text-right flex flex-col gap-4 w-80">
            <div className="flex items-end border-b-2 border-black pb-1">
              <span className="font-bold text-lg mr-2">Name:</span>
              <div className="flex-1"></div>
            </div>
            <div className="flex items-end border-b-2 border-black pb-1">
              <span className="font-bold text-lg mr-2">Date:</span>
              <div className="flex-1"></div>
            </div>
          </div>
        </div>

        {/* Print Sudoku Grid - Crisp B&W Borders */}
        <div className="w-[150mm] h-[150mm] mx-auto border-4 border-black box-border flex flex-col">
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
                        const displayVal = showSolution ? solution[r]?.[c] : puzzle[r]?.[c];
                        
                        return (
                          <div
                            key={`p-${r}-${c}`}
                            className={`flex-1 flex items-center justify-center border-r-[1px] border-black last:border-r-0 text-5xl font-black
                              ${!isClue && showSolution ? 'text-gray-400 italic' : 'text-black'}
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

        {/* Worksheet Footer */}
        <div className="mt-10 text-center border-t-2 border-black pt-4">
          <p className="text-xl font-bold">Good luck! Every puzzle has only one correct answer.</p>
          {showSolution && (
            <p className="text-lg font-bold text-gray-500 mt-2">Note: Solution is printed in gray italics.</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;
