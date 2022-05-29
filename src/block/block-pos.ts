export interface BlockPos {
    x: number;
    y: number;
    z: number;
}

export function sumBlockPos(...positions: BlockPos[]): BlockPos {
    return positions.reduce((result, pos) => ({
        x: result.x + pos.x,
        y: result.y + pos.y,
        z: result.z + pos.z,
    }));
}

export function roundBlockPos(pos: BlockPos): BlockPos {
    return modifyBlockPosValues(pos, Math.round);
}

export function floorBlockPos(pos: BlockPos): BlockPos {
   return modifyBlockPosValues(pos, Math.floor);
}

export function modifyBlockPosValues(pos: BlockPos, modify: (v: number) => number): BlockPos {
    return { x: modify(pos.x), y: modify(pos.y), z: modify(pos.z) };
}

export function isBlockPosIn(pos: BlockPos, from: BlockPos, to: BlockPos): boolean {
    return pos.x >= from.x && pos.x <= to.x && pos.y >= from.y && pos.y <= to.y && pos.z >= from.z && pos.z <= to.z;
}
