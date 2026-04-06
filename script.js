const Player = (name, marker)=> {
    let score = 0;
    const getName = () => name;
    const setName = (newName) => {name = newName; };
    const getMarker = () => marker;
    const getScore = () => score;
    const incrementScore = () => {score++; };
    const resetScore = () => {score = 0; };
    return { getName, setName, getMarker, getScore, incrementScore, resetScore };
};

const Gameboard = (() => {
    let board = Array(9).fill(null);

    const getBoard = () => [...board];

    const placeMarker = (index, marker) => {
        if(board[index] !== null) return false;
        board[index] = marker;
        return true;
    };

    const reset = () => {
        board = Array(9).fill(null);
    };

    const checkWinner = () => {
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];

        for (const [a, b, c] of wins) {
            if(board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], line: [a, b, c] };
            }
        }
        return null;
    };

    const isTie = () => board.every((cell) => cell !== null);

    return { getBoard, placeMarker, reset, checkWinner, isTie };
})();

const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameOver = false;
    let started = false;

    const init = (nameX, nameO) => {
        players = [
            Player(nameX || 'Player X', 'X'),
            Player(nameO || 'Player O', 'O'),
        ];
        currentPlayerIndex = 0;
        gameOver = false;
        started = true;
        Gameboard.reset();
    };

    const getCurrentPlayer = () => players[currentPlayerIndex];

    const getPlayers = () => players;

    const isStarted = () => started;
    const isGameOver = () => gameOver;

    const playTurn = (index) => {
        if (gameOver || !started) return { status: 'idle'};

        const player = getCurrentPlayer();
        const placed = Gameboard.placeMarker(index, player.getMarker());

        if (!placed) return { status: 'invalid'};

        const result = Gameboard.checkWinner();
        if (result) {
            gameOver = true;
            player.incrementScore();
            return { status: 'win', winner: player, line: result.line };
        }

        if (Gameboard.isTie()) {
            gameOver = true;
            return { status: 'tie'};
        }

        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
        return { status: 'continue', nextPlayer: getCurrentPlayer() };
    };

    const resetRound = () => {
        Gameboard.reset();
        currentPlayerIndex = 0;
        gameOver = false;
    };

    const resetAll = () => {
        Gameboard.reset();
        players.forEach((p) => p.resetScore());
        currentPlayerIndex = 0;
        gameOver = false;
        started = false;
    };

    return { init, getCurrentPlayer, getPlayers, isStarted, isGameOver, playTurn, resetRound, resetAll };
})();

const DisplayController = (() => {
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const cells = document.querySelectorAll('.cell');
    const statusMsg = document.getElementById('status-message');
    const playerXLabel = document.getElementById('player-x-label');
    const playerOLabel = document.getElementById('player-o-label');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const inputX = document.getElementById('name-x');
    const inputO = document.getElementById('name-o');
    const btnStart = document.getElementById('btn-start');
    const btnNextRound = document.getElementById('btn-next-round');
    const btnRestart = document.getElementById('btn-restart');
    const winLine = document.getElementById('win-line');

    const renderBoard = (highlightCells = []) => {
        const board = Gameboard.getBoard();
        cells.forEach((cell, i) => {
            cell.dataset.marker = board[i] || '';
            cell.classList.toggle('taken', board[i] !== null);
            cell.classList.toggle('winning', highlightCells.includes(i));
        })
    };

    const setStatus = (msg, type = '') => {
        statusMsg.textContent = msg;
        statusMsg.dataset.type = type;
    };

    const updateScores = () => {
        const [px, po] = GameController.getPlayers();
        scoreX.textContent = px.getScore();
        scoreO.textContent = po.getScore();
    };

    const highlightActivePlayer = () => {
        const current = GameController.getCurrentPlayer();
        playerXLabel.classList.toggle('active', current.getMarker() === 'X');
        playerOLabel.classList.toggle('active', current.getMarker() === 'O');
    };

    const drawWinLine = (line) => {
        const positions = line.map((i) => ({col: (i % 3) + 1, row: Math.floor(i / 3) + 1}));
        const grid = document.querySelector('.board-grid');
        const rect = grid.getBoundingClientRect();
        const cellSize = rect.width / 3;

        const cx = (pos) => (pos.col - 1) * cellSize + cellSize / 2;
        const cy = (pos) => (pos.row - 1) * cellSize + cellSize / 2;

        const x1 = cx(positions[0]);
        const y1 = cy(positions[0]);
        const x2 = cx(positions[2]);
        const y2 = cy(positions[2]);
 
        winLine.setAttribute('x1', x1);
        winLine.setAttribute('y1', y1);
        winLine.setAttribute('x2', x2);
        winLine.setAttribute('y2', y2);
 
        winLine.classList.add('visible');
    };

    const clearWinLine = () => {
        winLine.classList.remove('visible');
        winLine.setAttribute('x1', 0);
        winLine.setAttribute('y1', 0);
        winLine.setAttribute('x2', 0);
        winLine.setAttribute('y2', 0);
    };

    btnStart.addEventListener('click', () => {
        const nameX = inputX.value.trim() || 'Player X';
        const nameO = inputO.value.trim() || 'Player O';
        GameController.init(nameX, nameO);

        const [px, po] = GameController.getPlayers();
        playerXLabel.querySelector('.player-name').textContent = px.getName();
        playerOLabel.querySelector('.player-name').textContent = po.getName();

        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');

        renderBoard();
        updateScores();
        highlightActivePlayer();
        setStatus(`${GameController.getCurrentPlayer().getName()}'s turn`);
    });

    cells.forEach((cell) => {
        cell.addEventListener('click', () => {
            if (GameController.isGameOver()) return;

            const index = parseInt(cell.dataset.index);
            const result = GameController.playTurn(index);

            if (result.status === 'invalid') return;

            renderBoard(result.line || []);

            if(result.status === 'win') {
                setStatus(`${result.winner.getName()} wins! 🎉`, 'win');
                updateScores();
                drawWinLine(result.line);
                btnNextRound.classList.remove('hidden');
                playerXLabel.classList.remove('active');
                playerOLabel.classList.remove('active');
            } else if (result.status === 'tie') {
                setStatus("It's a tie! 🤝", 'tie');
                btnNextRound.classList.remove('hidden');
                playerXLabel.classList.remove('active');
                playerOLabel.classList.remove('active');
            } else {
                highlightActivePlayer();
                setStatus(`${result.nextPlayer.getName()}'s turn`);
            }
        });
    });

    btnNextRound.addEventListener('click', () => {
        GameController.resetRound();
        renderBoard();
        clearWinLine();
        highlightActivePlayer();
        setStatus(`${GameController.getCurrentPlayer().getName()}'s turn`);
        btnNextRound.classList.add('hidden');
    });

    btnRestart.addEventListener('click', () => {
        GameController.resetAll();
        renderBoard();
        clearWinLine();
        updateScores();
        gameScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
        btnNextRound.classList.add('hidden');
    });

    [inputX, inputO].forEach((inp) =>
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') btnStart.click();
        })
    );

    return {};
})();