export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

// Supported board sizes: classic 9x9 (3x3 boxes) and the 4x4 Mini board
// (2x2 boxes) for younger players.
export type GridSize = 9 | 4;

export interface SudokuPuzzle {
  puzzle: number[][];
  solution: number[][];
}

export class SudokuGenerator {
  private grid: number[][];
  private size = 9;
  private box = 3;

  constructor() {
    this.grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  private isValid(grid: number[][], row: number, col: number, num: number): boolean {
    for (let x = 0; x < this.size; x++) {
      if (grid[row][x] === num) return false;
    }
    for (let x = 0; x < this.size; x++) {
      if (grid[x][col] === num) return false;
    }
    const startRow = Math.floor(row / this.box) * this.box;
    const startCol = Math.floor(col / this.box) * this.box;
    for (let r = startRow; r < startRow + this.box; r++) {
      for (let c = startCol; c < startCol + this.box; c++) {
        if (grid[r][c] === num) return false;
      }
    }
    return true;
  }

  private fillGrid(grid: number[][]): boolean {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (grid[row][col] === 0) {
          const numbers = Array.from({ length: this.size }, (_, i) => i + 1).sort(
            () => Math.random() - 0.5,
          );
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
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= this.size; num++) {
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
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        cells.push([r, c]);
      }
    }
    cells.sort(() => Math.random() - 0.5);

    let currentClues = this.size * this.size;
    for (const [row, col] of cells) {
      if (currentClues <= targetClues) break;

      const temp = grid[row][col];
      grid[row][col] = 0;

      const gridCopy = grid.map((row) => [...row]);
      if (this.countSolutions(gridCopy) !== 1) {
        grid[row][col] = temp;
      } else {
        currentClues -= 1;
      }
    }
    return grid;
  }

  public generate(difficulty: Difficulty = 'Easy', size: GridSize = 9): SudokuPuzzle {
    this.size = size;
    this.box = Math.sqrt(size);
    // Clues are tuned per board: a 4x4 has 16 cells total, so its targets
    // are much smaller than the 9x9's (81 cells).
    const cluesMap: Record<GridSize, Record<Difficulty, number>> = {
      9: { Easy: 40, Medium: 32, Hard: 26, Expert: 20 },
      4: { Easy: 10, Medium: 8, Hard: 6, Expert: 5 },
    };
    const targetClues = cluesMap[size][difficulty] ?? cluesMap[size].Easy;

    // Generate a fresh full grid
    this.grid = Array.from({ length: size }, () => Array(size).fill(0));
    this.fillGrid(this.grid);

    // Copy it to keep as the solution
    const solution = this.grid.map((row) => [...row]);

    // Create the puzzle by removing numbers from a copy of the solution
    const puzzleGrid = solution.map((row) => [...row]);
    this.removeNumbers(puzzleGrid, targetClues);

    return {
      puzzle: puzzleGrid,
      solution: solution,
    };
  }
}
