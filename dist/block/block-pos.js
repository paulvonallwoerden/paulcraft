export function sumBlockPos() {
    var positions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        positions[_i] = arguments[_i];
    }
    return positions.reduce(function (result, pos) { return ({
        x: result.x + pos.x,
        y: result.y + pos.y,
        z: result.z + pos.z,
    }); });
}
export function roundBlockPos(pos) {
    return modifyBlockPosValues(pos, Math.round);
}
export function floorBlockPos(pos) {
    return modifyBlockPosValues(pos, Math.floor);
}
export function modifyBlockPosValues(pos, modify) {
    return { x: modify(pos.x), y: modify(pos.y), z: modify(pos.z) };
}
