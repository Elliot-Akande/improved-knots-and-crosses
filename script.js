const PlayerFactory = (name, marker) => {
    const _name = name;
    const _marker = marker;

    const getName = () => _name;
    const getMarker = () => _marker;

    return {
        getName,
        getMarker,
    };
}

const gameBoard = (() => {
    const _board = [["", "", "",], 
                    ["", "", "",], 
                    ["", "", "",]];
    
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

