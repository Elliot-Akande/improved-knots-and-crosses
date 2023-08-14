const PlayerFactory = (name, marker) => {
    const _name = name;
    const _marker = marker;

    let _score = 0;

    const getName = () => _name;
    const getMarker = () => _marker;
    const getScore = () => _score;

    const setName = (name) => _name = name;
    const addPoint = () => _score++;

    const resetScore = () => _score = 0;

    return {
        getName,
        getMarker,
        getScore,
        setName,
        addPoint,
        resetScore,
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

    const _isRoundOver = () => {
        if (_isWin()) {
            _activePlayer.addPoint();
            _eventEmitter.emit('roundOver', 'win');
            _checkGameOver();
            return true;
        };
        if (_isTieGame()) {
            _eventEmitter.emit('roundOver', 'tie');
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

    const _checkGameOver = () => {
        score = getScore();
        if (score[0] === 3 || score[1] === 3) {    //  Best of Three
            _eventEmitter.emit('gameOver', _activePlayer);
        }
    };

    const getActivePlayer = () => _activePlayer;

    const getScore = () => [_player[0].getScore(), _player[1].getScore()];

    const playRound = (row, col) => {
        gameBoard.play(row, col, _activePlayer);

        if (!_isRoundOver()) _switchPlayerTurn();
    };

    const newRound = () => {
        gameBoard.clear();
        _activePlayer = _player[0];
        _eventEmitter.emit('newRound');
    };

    const newGame = () => {
        _player.forEach(player => player.resetScore());
        _eventEmitter.emit('newGame');
        newRound();
    }

    const addEventListener = (name, callback) => {
        _eventEmitter.on(name, callback);
    }

    return {
        getActivePlayer,
        getScore,
        playRound,
        newRound,
        newGame,
        addEventListener,
        getBoard: gameBoard.getBoard,
    };
})();

const displayController = (() => {
    const playerTurnDiv = document.querySelector('.turn');
    const playerScoreDiv = document.querySelector('.score');
    const boardDiv = document.querySelector('.board');

    const displayGameStart = () => {
        displayPlayerTurn();
        displayPlayerScores();
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

    const displayPlayerScores = () => {
        const score = gameController.getScore();
        playerScoreDiv.textContent = `${score[0]} - ${score[1]}`;
    }

    const updateBoard = () => {
        const cells = boardDiv.querySelectorAll('.cell');
        const board = gameController.getBoard();

        cells.forEach(cell => {
            const row = cell.dataset.row;
            const col = cell.dataset.col;

            cell.textContent = board[row][col];
        });
    };

    const handleRoundOver = (endType) => {
        endType === 'win' ? displayWin() : displayTie();
        toggleNextButton();
        toggleBoardDisabled();
    };

    const handleGameOver = (winner) => {
        const modalText = document.querySelector('.modal > h1');
        modalText.textContent = `${winner.getName()} is the champion!`;

        toggleNextButton();
        toggleModal();
    };

    const handleNewRound = () => {
        displayPlayerTurn();
        updateBoard();
        toggleNextButton();
        toggleBoardDisabled();
    };

    const handleNewGame = () => {
        toggleModal();
        toggleNextButton();
        displayPlayerScores();
    }

    const displayTie = () => {
        playerTurnDiv.textContent = `Tie Game!`;
    };

    const displayWin = () => {
        const player = gameController.getActivePlayer();
        playerTurnDiv.textContent = `${player.getName()} Wins!`;
        displayPlayerScores();
    };

    const toggleModal = () => {
        const modalContainer = document.querySelector('.modal-container');
        modalContainer.classList.toggle('hidden');
    }

    const toggleBoardDisabled = () => {
        const buttons = boardDiv.querySelectorAll('.cell');
        buttons.forEach(button => button.disabled = !button.disabled);
    };

    const toggleNextButton = () => {
        const nextButton = document.querySelector('.next');
        nextButton.classList.toggle('hidden');
    }

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

        const nextButton = document.querySelector('.next');
        nextButton.addEventListener('click', gameController.newRound);

        const rematchButton = document.querySelector('.modal > .yes');
        rematchButton.addEventListener('click', gameController.newGame);

        gameController.addEventListener('roundOver', handleRoundOver);
        gameController.addEventListener('gameOver', handleGameOver);
        gameController.addEventListener('activePlayerUpdate', displayPlayerTurn);
        gameController.addEventListener('newRound', handleNewRound);
        gameController.addEventListener('newGame', handleNewGame);
    };

    displayGameStart();
    initEventListeners();
})();

