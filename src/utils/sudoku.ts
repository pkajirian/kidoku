export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface SudokuPuzzle {
  puzzle: number[][];
  solution: number[][];
}

export class SudokuGenerator {
  private grid: number[][];

  constructor() {
    this.grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  private isValid(grid: number[][], row: number, col: number, num: number): boolean {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (grid[r][c] === num) return false;
      }
    }
    return true;
  }

  private fillGrid(grid: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const numbers = Array.from({ length: 9 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
          for (const num of numbers) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (this.fillGrid(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private countSolutions(grid: number[][], limit = 2): number {
    let count = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num;
              count += this.countSolutions(grid, limit);
              grid[row][col] = 0;
              if (count >= limit) return count;
            }
          }
          return count;
        }
      }
    }
    return 1;
  }

  private removeNumbers(grid: number[][], targetClues: number): number[][] {
    const cells: [number, number][] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        cells.push([r, c]);
      }
    }
    cells.sort(() => Math.random() - 0.5);

    let currentClues = 81;
    for (const [row, col] of cells) {
      if (currentClues <= targetClues) break;

      const temp = grid[row][col];
      grid[row][col] = 0;

      const gridCopy = grid.map(row => [...row]);
      if (this.countSolutions(gridCopy) !== 1) {
        grid[row][col] = temp;
      } else {
        currentClues -= 1;
      }
    }
    return grid;
  }

  public generate(difficulty: Difficulty = 'Easy'): SudokuPuzzle {
    const cluesMap: Record<Difficulty, number> = {
      'Easy': 40,
      'Medium': 32,
      'Hard': 26,
      'Expert': 20
    };
    const targetClues = cluesMap[difficulty] || 40;

    // Generate a fresh full grid
    this.grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.fillGrid(this.grid);

    // Copy it to keep as the solution
    const solution = this.grid.map(row => [...row]);

    // Create the puzzle by removing numbers from a copy of the solution
    const puzzleGrid = solution.map(row => [...row]);
    this.removeNumbers(puzzleGrid, targetClues);

    return {
      puzzle: puzzleGrid,
      solution: solution
    };
  }
}
