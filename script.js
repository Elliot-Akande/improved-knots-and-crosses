const PlayerFactory = (name, marker) => {
    const _name = name;
    const _marker = marker;

    const getName = () => _name;
    const getMarker = () => _marker;

    const setName = (name) => _name = name;

    return {
        getName,
        getMarker,
        setName,
    };
}

const EventEmitterFactory = () => {
    const _listeners = [];

    const emit = (eventName, data) => {
        this._listeners
            .filter(({ name }) => name === eventName)
            .forEach(({ callback }) => callback.apply(this, [this, ...data]));
    };

    const on = (name, callback) => {
        if (typeof callback === 'function' && typeof eventName === 'string') {
            this._listeners.push({ name, callback })
        }
    };

    return {
        emit,
        on,
    };
}

const gameBoard = (() => {
    const _board = [
        ["", "", "",],
        ["", "", "",],
        ["", "", "",]
    ];


    const play = (row, col, player) => {
        if (_board[row][col] !== "") return;

        _board[row][col] = player.getMarker();
    };

    const getBoard = () => _board;

    const clear = () => {
        _board.forEach(row => row.fill(""));
    };

    return {
        play,
        getBoard,
        clear,
    };
})();

gameController = (() => {
    const _player = [
        PlayerFactory("Player One", "X"),
        PlayerFactory("Player Two", "O")
    ];

    let _activePlayer = _player[0];

    const _switchPlayerTurn = () => {
        _activePlayer = _activePlayer === _player[0] ? _player[1] : _player[0];
    };

    const _getNewRoundMessage = () => {
        return `${_activePlayer.getName()}'s turn!`;
    };

    const _getEndMessage = (endType) => {
        if (endType === "tie") return "Tie Game!";

        return `${_activePlayer.getName()} Wins!`;
    };

    const _checkGameOver = () => {
        if (_isWin()) return 'win';
        if (_isTieGame()) return 'tie';

        return false;
    };

    const _isWin = () => {
        const board = gameBoard.getBoard();
        const marker = _activePlayer.getMarker();

        for (let i = 0; i < 3; i++) {
            //  Check rows
            if (board[i].every(cell => cell === marker)) return true;

            //  Check columns
            const col = board.map(elem => elem[i]);
            if (col.every(cell => cell === marker)) return true;
        }

        //  Check diagonals
        const diagOne = [board[0][0], board[1][1], board[2][2]];
        if (diagOne.every(cell => cell === marker)) return true;

        const diagTwo = [board[0][2], board[1][1], board[2][0]];
        if (diagTwo.every(cell => cell === marker)) return true;

        return false;
    };

    const _isTieGame = () => {
        const board = gameBoard.getBoard();
        return !board.flat().includes("");
    };

    const getActivePlayer = () => _activePlayer;

    const playRound = (row, col) => {
        gameBoard.play(row, col, _activePlayer);

        const gameOverType = _checkGameOver();
        if (!gameOverType) {
            _switchPlayerTurn();
            console.log(_getNewRoundMessage());
            console.table(gameBoard.getBoard());
            return;
        }

        console.log(_getEndMessage(gameOverType));
    };

    return {
        getActivePlayer,
        playRound,
        getBoard: gameBoard.getBoard,
    };
})();

const displayController = (() => {
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');

    const updateScreen = () => {
        boardDiv.textContent = "";

        displayPlayerTurn();
        displayBoardSquares();
    };

    const displayPlayerTurn = () => {
        const player = gameController.getActivePlayer();
        playerTurnDiv.textContent = `${player.getName()}'s turn!`;
    };

    const displayBoardSquares = () => {
        const board = gameController.getBoard();

        board.forEach((row, rowNum) => {
            row.forEach((cell, colNum) => {
                const cellButton = document.createElement('button');
                cellButton.classList.add('cell');
                cellButton.dataset.row = rowNum;
                cellButton.dataset.col = colNum;
                cellButton.textContent = cell;

                boardDiv.appendChild(cellButton);
            })
        });
    };

    const clickHandlerBoard = (e) => {
        const row = e.target.dataset.row;
        const col = e.target.dataset.col;

        //  Make sure cell pressed and not gap between cells
        if (!(row && col)) return;

        gameController.playRound(row, col);
        updateScreen();
    };

    boardDiv.addEventListener('click', clickHandlerBoard);

    updateScreen();
})();

