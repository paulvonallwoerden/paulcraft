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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Vector3 } from "three";
import { Block } from "./block";
import { BlockFaces } from "./block-face";
import { Blocks } from "./blocks";
export var DirtBlockModel = {
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 15, 15],
            faces: BlockFaces.reduce(function (faces, face) {
                var _a;
                return (__assign(__assign({}, faces), (_a = {}, _a[face] = {
                    cull: true,
                    texture: 'textures/blocks/dirt.png',
                }, _a)));
            }, {}),
        },
    ],
};
var DirtBlock = /** @class */ (function (_super) {
    __extends(DirtBlock, _super);
    function DirtBlock() {
        return _super.call(this, 'dirt', [DirtBlockModel]) || this;
    }
    DirtBlock.prototype.onRandomTick = function (level, pos) {
        if (level.getBlockAt(new Vector3(pos.x, pos.y + 1, pos.z)) !== Blocks.AIR) {
            return;
        }
        if (this.isNearGrass(level, pos)) {
            level.setBlockAt(new Vector3(pos.x, pos.y, pos.z), Blocks.GRASS);
        }
    };
    DirtBlock.prototype.isNearGrass = function (level, pos) {
        for (var i = -1; i < 2; i++) {
            if (this.isGrassAtRelative(level, pos, { x: 1, y: i, z: 0 })) {
                return true;
            }
        }
        for (var i = -1; i < 2; i++) {
            if (this.isGrassAtRelative(level, pos, { x: -1, y: i, z: 0 })) {
                return true;
            }
        }
        for (var i = -1; i < 2; i++) {
            if (this.isGrassAtRelative(level, pos, { x: 0, y: i, z: 1 })) {
                return true;
            }
        }
        for (var i = -1; i < 2; i++) {
            if (this.isGrassAtRelative(level, pos, { x: 0, y: i, z: -1 })) {
                return true;
            }
        }
        return false;
    };
    DirtBlock.prototype.isGrassAtRelative = function (level, pos, offset) {
        return level.getBlockAt(new Vector3(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z)) === Blocks.GRASS;
    };
    return DirtBlock;
}(Block));
export { DirtBlock };
