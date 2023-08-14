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
        _listeners
            .filter(({ name }) => name === eventName)
            .forEach(({ callback }) => callback.call(this, data));
    };

    const on = (name, callback) => {
        if (typeof callback === 'function' && typeof name === 'string') {
            _listeners.push({ name, callback })
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

const gameController = (() => {
    const _eventEmitter = EventEmitterFactory();
    const _player = [
        PlayerFactory("Player One", "X"),
        PlayerFactory("Player Two", "O")
    ];

    let _activePlayer = _player[0];

    const _switchPlayerTurn = () => {
        _activePlayer = _activePlayer === _player[0] ? _player[1] : _player[0];
        _eventEmitter.emit('activePlayerUpdate', _activePlayer);
    };

    const _isGameOver = () => {
        if (_isWin()) {
            _eventEmitter.emit('gameOver', 'win');
            return true;
        };
        if (_isTieGame()) {
            _eventEmitter.emit('gameOver', 'tie');
            return true;
        };
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

        if (!_isGameOver()) _switchPlayerTurn();
    };

    const addEventListener = (name, callback) => {
        _eventEmitter.on(name, callback);
    }

    return {
        getActivePlayer,
        playRound,
        addEventListener,
        getBoard: gameBoard.getBoard,
    };
})();

const displayController = (() => {
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');

    const displayGameStart = () => {
        displayPlayerTurn();
        initBoard();
    }

    const initBoard = (() => {
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
    });

    const displayPlayerTurn = () => {
        player = gameController.getActivePlayer();
        playerTurnDiv.textContent = `${player.getName()}'s turn!`;
    };

    const updateBoard = () => {
        const cells = boardDiv.querySelectorAll('.cell');
        const board = gameController.getBoard();

        cells.forEach(cell => {
            const row = cell.dataset.row;
            const col = cell.dataset.col;

            cell.textContent = board[row][col];
        });
    };

    const handleGameOver = (endType) => {
        endType === 'win' ? displayWin() : displayTie();
        disableBoard();
    };

    const displayTie = () => {
        playerTurnDiv.textContent = `Tie Game!`;
    };

    const displayWin = () => {
        const player = gameController.getActivePlayer();
        playerTurnDiv.textContent = `${player.getName()} Wins!`;
    };

    const disableBoard = () => {
        const buttons = boardDiv.querySelectorAll('.cell');
        buttons.forEach(button => button.disabled = true);
    };

    const clickHandlerCell = (e) => {
        const row = e.target.dataset.row;
        const col = e.target.dataset.col;

        //  Make sure cell pressed and not gap between cells
        if (!(row && col)) return;

        gameController.playRound(row, col);
        updateBoard();
    };

    const initEventListeners = () => {
        const cells = boardDiv.querySelectorAll('.cell');
        cells.forEach(cell => cell.addEventListener('click', clickHandlerCell));

        gameController.addEventListener('gameOver', handleGameOver);
        gameController.addEventListener('activePlayerUpdate', displayPlayerTurn);
    };

    displayGameStart();
    initEventListeners();
})();

