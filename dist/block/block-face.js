export var BlockFace;
(function (BlockFace) {
    BlockFace["TOP"] = "top";
    BlockFace["BOTTOM"] = "bottom";
    BlockFace["RIGHT"] = "right";
    BlockFace["LEFT"] = "left";
    BlockFace["FRONT"] = "front";
    BlockFace["BACK"] = "back";
})(BlockFace || (BlockFace = {}));
export var BlockFaces = [
    BlockFace.TOP,
    BlockFace.BOTTOM,
    BlockFace.RIGHT,
    BlockFace.LEFT,
    BlockFace.FRONT,
    BlockFace.BACK,
];
export function blockFaceByNormal(normal) {
    if (normal.x === 1) {
        return BlockFace.RIGHT;
    }
    if (normal.x === -1) {
        return BlockFace.LEFT;
    }
    if (normal.y === 1) {
        return BlockFace.TOP;
    }
    if (normal.y === -1) {
        return BlockFace.BOTTOM;
    }
    if (normal.z === 1) {
        return BlockFace.FRONT;
    }
    if (normal.z === -1) {
        return BlockFace.BACK;
    }
}
export function normalByBlockFace(face) {
    switch (face) {
        case BlockFace.RIGHT: return { x: 1, y: 0, z: 0 };
        case BlockFace.LEFT: return { x: -1, y: 0, z: 0 };
        case BlockFace.TOP: return { x: 0, y: 1, z: 0 };
        case BlockFace.BOTTOM: return { x: 0, y: -1, z: 0 };
        case BlockFace.FRONT: return { x: 0, y: 0, z: 1 };
        case BlockFace.BACK: return { x: 0, y: 0, z: -1 };
    }
}
