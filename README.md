# Tic Tac Toe

A browser based Tic Tac Toe game built with vanilla HTML, CSS and JavaScript.

🎮 **[Play it here](https://aakashsp30.github.io/tic_tac_toe/)**

## How to Play

1. Enter names for Player X and Player O
2. Click **Start Game**
3. Take turns clicking cells to place your marker
4. First to get 3 in a row wins!
5. Click **Next Round** to play again or **Restart** to reset everything

## Features

- Two player local game
- Win detection for all rows, columns and diagonals
- Tie detection
- Score tracking across rounds
- Win line highlighting the winning cells
- Player name input
- Rectro arcade aesthetic

## JavaScript Architecture

The game logic is split into three modules, each wrapped in an IFFE to keep them as single instances and avoid polluting the global scope.

- **Player** — factory function that creates a player object with a name, marker (X or O) and score

- **Gameboard** — manages the board array, placing markers, checking for a winner and ties

- **GameController** — controls the flow of the game, tracks whose turn it is and handles round/game resets

- **DisplayController** — handles all DOM interactions, renders the board and reacts to player input