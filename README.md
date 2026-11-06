# Kiduku: Arcade Sudoku Puzzle Game for Kids (8+)

**Kiduku** is a sleek, modern, and highly interactive Sudoku puzzle game designed specifically for mature kids aged 8 and older. Inspired by modern console indie puzzle games (like on Nintendo Switch), Kiduku brings logic deduction to life with beautiful gaming themes, a native chiptune synthesizer, quest modes, and fully responsive touchscreen tablet support.

---

## ✨ Features

* **🎮 Interactive Play Mode**: Click or tap any empty cell on the board to select it. Intersecting rows, columns, and 3x3 blocks light up smoothly, and matching values are highlighted across the grid to help players learn Sudoku logic.
* **⚔️ RPG Quest Mode**: Toggle between standard digits (`🔢 Numbers`) and adventure items (`⚔️ Quest Mode`) at any time! Numbers 1–9 map directly to iconic quest gear:
  * `⚔️ Sword`, `🛡️ Shield`, `💎 Gem`, `🧪 Potion`, `🪙 Coin`, `🔑 Key`, `👑 Crown`, `🔥 Fireball`, `⭐ Star`
* **🎵 Programmatic 8-Bit Synth**: Features a built-in retro sound effects engine written natively with the browser **Web Audio API** (zero file downloads needed!). Enjoy tactile triangle-wave select blips, satisfying bubble placements, retro sawtooth error buzzers, and a triumphant levels arpeggio arpeggio on victory.
* **📱 Tablet & Touch Optimized**: Engineered with large tapping targets (minimum 70px touch surfaces on numpads), immediate touch-manipulation feedback (removes standard browser 300ms double-tap delay), and text-selection safeguards to allow rapid tapping on iPads and Android tablets.
* **🎨 Sleek Gaming Themes**:
  * `🧬 Cyberpunk Neon` (Default): Deep glowing violet dark mode with neon cyan and magenta outlines.
  * `🕹️ Retro Arcade`: Green-tinted screen lines (`crt-overlay`) with a pixelated retro gaming font.
  * `🌐 Minimalist Glass`: Smooth frosted-glass overlays floating over rich pastel gradients.
* **❤️ Shield / Heart Lives**: Track performance with three gaming hearts. Entering incorrect inputs shakes the grid and removes a heart.
* **↩️ Undo**: Take back any move — placements, clears, hints, even mistakes (lives included). Tap the Undo button or press Ctrl/Cmd+Z.
* **⏸️ Pause**: Pause stops the timer and covers the board so nobody can peek. Big Pause button in the controls, the ⏸️ by the timer, or press P.
* **🧩 4×4 Mini Mode**: A smaller 4×4 board (2×2 boxes, numbers 1–4) for younger players or a quick game. Switch between 9×9 and 4×4 Mini in the top control panel — difficulty, Quest Mode, and printable worksheets all work in Mini mode too.
* **💡 Tactical Hint Lightbulb**: Trapped on a difficult square? Select the cell and click the hint button to mathematically reveal the correct solution (increments a hint count).
* **📈 Victory Star Ratings**: Completing a board displays an arcade summary, tracking elapsed time, total mistakes, and hints used to award a 1, 2, or 3-star gaming score.
* **🖨️ Printable Worksheets**: Dedicated grayscale print view strips all gaming HUDs and colors, translating quest items back to crisp, clean high-contrast numbers for perfect home printing.
* **📲 Installable App (PWA)**: Kiduku is a Progressive Web App — install it on a tablet or phone home screen and play offline. On iPad, open the game in Safari, tap Share → Add to Home Screen. On Android/Chrome, tap the Install prompt (or ⋮ → Install app). The service worker caches the game shell, so it opens even with no connection. App icons are generated at build time by `scripts/generate-icons.mjs` (pure Node, no extra dependencies). Fonts are bundled with the app (no Google Fonts CDN), so the game looks right offline too.

---

## 🕹️ How to Play

### Controls
* **Mouse & Touch**: Click or tap any cell in the 9x9 grid to select it, then tap an item on the on-screen keypad to place a value.
* **Keyboard Navigation**: Use the **Arrow Keys** to move the cursor smoothly around the board.
* **Keyboard Inputs**: Type keys **`1` through `9`** to place values, and press **`Backspace`**, **`Delete`**, or **`0`** to erase a square.

---

## 🚀 Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the link displayed in your terminal (usually [http://localhost:5173](http://localhost:5173)) in your browser.

### Building for Production
To bundle and compile the application:
```bash
npm run build
```
The output bundle will be created in the `dist/` folder, ready for direct deployment on static web hostings like GitHub Pages, Vercel, Netlify, or AWS.