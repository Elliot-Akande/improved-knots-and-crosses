const PlayerFactory = (name, marker) => {
    const _marker = marker;

    let _name = name;
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
            if (board[i].every(cell => cell === marker)) {
                _eventEmitter.emit('winFound', { row: i });
                return true;
            };

            //  Check columns
            const col = board.map(elem => elem[i]);
            if (col.every(cell => cell === marker)) {
                _eventEmitter.emit('winFound', { col: i });
                return true;
            };
        }

        //  Check diagonals
        const diagOne = [board[0][0], board[1][1], board[2][2]];
        if (diagOne.every(cell => cell === marker)) {
            _eventEmitter.emit('winFound', { diag: 1 });
            return true;
        };

        const diagTwo = [board[0][2], board[1][1], board[2][0]];
        if (diagTwo.every(cell => cell === marker)) {
            _eventEmitter.emit('winFound', { diag: 2 });
            return true;
        };

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
        const board = gameBoard.getBoard();
        if (board[row][col] !== "") return;

        gameBoard.play(row, col, _activePlayer);

        if (!_isRoundOver()) _switchPlayerTurn();
    };

    const newRound = () => {
        gameBoard.clear();
        _switchPlayerTurn();
        _eventEmitter.emit('newRound');
    };

    const newGame = () => {
        _player.forEach(player => player.resetScore());
        _eventEmitter.emit('newGame');
        newRound();
    }

    const setPlayerName = (playerNum, name) => {
        _player[playerNum].setName(name);
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
        setPlayerName,
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
        playerTurnDiv.classList.toggle('turn-over');
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
        const winningCells = document.querySelectorAll('.cell.winning-cell');
        winningCells.forEach(cell => cell.classList.toggle('winning-cell'));
        playerTurnDiv.classList.toggle('turn-over');
        displayPlayerTurn();
        updateBoard();
        toggleNextButton();
        toggleBoardDisabled();
    };

    const handleWinFound = (data) => {
        const cells = [];
        if (!isNaN(data.row)) {
            cells.push({ row: data.row, col: 0 });
            cells.push({ row: data.row, col: 1 });
            cells.push({ row: data.row, col: 2 });
        } else if (!isNaN(data.col)) {
            cells.push({ row: 0, col: data.col });
            cells.push({ row: 1, col: data.col });
            cells.push({ row: 2, col: data.col });
        } else {
            if (data.diag === 1) {
                cells.push({ row: 0, col: 0 });
                cells.push({ row: 1, col: 1 });
                cells.push({ row: 2, col: 2 });
            } else {
                cells.push({ row: 0, col: 2 });
                cells.push({ row: 1, col: 1 });
                cells.push({ row: 2, col: 0 });
            }
        }

        cells.forEach(cell => {
            const cellButton = document.querySelector('button.cell[data-row="' + cell.row + '"][data-col="' + cell.col + '"]');
            cellButton.classList.toggle('winning-cell');
        })
    };

    const handleNewGame = () => {
        toggleModal();
        toggleNextButton();
        displayPlayerScores();
    };

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

    const playButtonPressed = (e) => {
        const header = document.querySelector('header');
        const form = document.querySelector('form');
        const button = e.target;

        header.classList.toggle('center');
        form.classList.toggle('hidden');
        button.classList.toggle('hidden');

    };

    const homeButtonPressed = () => {
        location.reload();
    }

    const startGamePressed = (e) => {
        e.preventDefault();
        const playerOneName = document.querySelector('[name="player_one"]').value;
        const playerTwoName = document.querySelector('[name="player_two"]').value;

        if (playerOneName) gameController.setPlayerName(0, playerOneName);
        if (playerTwoName) gameController.setPlayerName(1, playerTwoName);

        const form = document.querySelector('form');
        const container = document.querySelector('.container');

        form.classList.toggle('hidden');
        container.classList.toggle('hidden');

        displayPlayerTurn();
    }

    const initEventListeners = () => {
        const cells = boardDiv.querySelectorAll('.cell');
        cells.forEach(cell => cell.addEventListener('click', clickHandlerCell));

        const nextButton = document.querySelector('.next');
        nextButton.addEventListener('click', gameController.newRound);

        const rematchButton = document.querySelector('.modal .yes');
        rematchButton.addEventListener('click', gameController.newGame);

        const homeButton = document.querySelector('.modal .no');
        homeButton.addEventListener('click', homeButtonPressed);

        const playButton = document.querySelector('header > .play');
        playButton.addEventListener('click', playButtonPressed);

        const form = document.querySelector('form');
        form.addEventListener('submit', startGamePressed);

        gameController.addEventListener('roundOver', handleRoundOver);
        gameController.addEventListener('gameOver', handleGameOver);
        gameController.addEventListener('activePlayerUpdate', displayPlayerTurn);
        gameController.addEventListener('newRound', handleNewRound);
        gameController.addEventListener('newGame', handleNewGame);
        gameController.addEventListener('winFound', handleWinFound);
    };

    displayGameStart();
    initEventListeners();
})();

