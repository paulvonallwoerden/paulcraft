var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a;
import { Vector3 } from "three";
import { Block } from "./block";
import { BlockFace } from "./block-face";
import { Blocks } from "./blocks";
export var GrassBlockModel = {
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 15, 15],
            faces: (_a = {},
                _a[BlockFace.TOP] = {
                    cull: true,
                    texture: 'textures/blocks/grass_block_top.png',
                },
                _a[BlockFace.LEFT] = {
                    cull: true,
                    texture: 'textures/blocks/grass_block_side.png',
                },
                _a[BlockFace.RIGHT] = {
                    cull: true,
                    texture: 'textures/blocks/grass_block_side.png',
                },
                _a[BlockFace.FRONT] = {
                    cull: true,
                    texture: 'textures/blocks/grass_block_side.png',
                },
                _a[BlockFace.BACK] = {
                    cull: true,
                    texture: 'textures/blocks/grass_block_side.png',
                },
                _a[BlockFace.BOTTOM] = {
                    cull: true,
                    texture: 'textures/blocks/dirt.png',
                },
                _a)
        },
    ],
};
var GrassBlock = /** @class */ (function (_super) {
    __extends(GrassBlock, _super);
    function GrassBlock() {
        return _super.call(this, 'grass', [GrassBlockModel]) || this;
    }
    GrassBlock.prototype.onRandomTick = function (level, pos) {
        var blockAbove = level.getBlockAt(new Vector3(pos.x, pos.y + 1, pos.z));
        if (blockAbove === Blocks.AIR) {
            return;
        }
        level.setBlockAt(new Vector3(pos.x, pos.y, pos.z), Blocks.DIRT);
    };
    return GrassBlock;
}(Block));
export { GrassBlock };
