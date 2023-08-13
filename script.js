const playerFactory = (name, marker) => {
    const _name = name;
    const _marker = marker;

    const getName = () => _name;
    const getMarker = () => _marker;

    return {
        getName,
        getMarker,
    };
}
