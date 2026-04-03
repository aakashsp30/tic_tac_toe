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
                return { winner: board[a], line: [a, b, c]}
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
    ;}

    const resetAll = () => {
        Gameboard.reset();
        players.forEach((p) => p.resetScore());
        currentPlayerIndex = 0;
        gameOver = false;
        started = false;
    };

    return { init, getCurrentPlayer, getPlayers, isStarted, isGameOver, playTurn, resetRound, resetAll };
})();