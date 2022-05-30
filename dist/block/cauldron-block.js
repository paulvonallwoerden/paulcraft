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
var _a;
import { randomElement } from "../util/random-element";
import { Block } from "./block";
import { BlockFace, BlockFaces } from "./block-face";
import { BlockState } from "./block-state/block-state";
var CauldronBlockModelSideFaces = (_a = {},
    _a[BlockFace.TOP] = { texture: 'textures/blocks/cauldron_top.png' },
    _a[BlockFace.BOTTOM] = { texture: 'textures/blocks/cauldron_bottom.png' },
    _a[BlockFace.LEFT] = { texture: 'textures/blocks/cauldron_side.png' },
    _a[BlockFace.RIGHT] = { texture: 'textures/blocks/cauldron_side.png' },
    _a[BlockFace.FRONT] = { texture: 'textures/blocks/cauldron_side.png' },
    _a[BlockFace.BACK] = { texture: 'textures/blocks/cauldron_side.png' },
    _a);
export function makeCauldronBlockModel(level) {
    var _a;
    var model = {
        elements: [
            // Sides
            {
                from: [0, 2, 0],
                to: [15, 15, 2],
                faces: CauldronBlockModelSideFaces,
            },
            {
                from: [0, 2, 13],
                to: [15, 15, 15],
                faces: CauldronBlockModelSideFaces,
            },
            {
                from: [0, 2, 2],
                to: [2, 15, 13],
                faces: CauldronBlockModelSideFaces,
            },
            {
                from: [13, 2, 2],
                to: [15, 15, 13],
                faces: CauldronBlockModelSideFaces,
            },
            // Legs
            {
                from: [0, 0, 0],
                to: [5, 2, 5],
                faces: BlockFaces.reduce(function (faces, face) {
                    var _a;
                    return (__assign(__assign({}, faces), (_a = {}, _a[face] = {
                        cull: false,
                        texture: 'textures/blocks/cauldron_side.png',
                    }, _a)));
                }, {}),
            },
            {
                from: [13, 0, 0],
                to: [15, 4, 2],
                faces: BlockFaces.reduce(function (faces, face) {
                    var _a;
                    return (__assign(__assign({}, faces), (_a = {}, _a[face] = {
                        cull: false,
                        texture: 'textures/blocks/cauldron_side.png',
                    }, _a)));
                }, {}),
            },
            {
                from: [0, 0, 13],
                to: [2, 4, 15],
                faces: BlockFaces.reduce(function (faces, face) {
                    var _a;
                    return (__assign(__assign({}, faces), (_a = {}, _a[face] = {
                        cull: false,
                        texture: 'textures/blocks/cauldron_side.png',
                    }, _a)));
                }, {}),
            },
            {
                from: [13, 0, 13],
                to: [15, 4, 15],
                faces: BlockFaces.reduce(function (faces, face) {
                    var _a;
                    return (__assign(__assign({}, faces), (_a = {}, _a[face] = {
                        cull: false,
                        texture: 'textures/blocks/cauldron_side.png',
                    }, _a)));
                }, {}),
            },
        ],
    };
    if (level <= 0) {
        return model;
    }
    model.elements.push({
        from: [2, 3 + (level - 1) * 5, 2],
        to: [13, 3 + (level - 1) * 5, 13],
        faces: (_a = {},
            _a[BlockFace.TOP] = {
                cull: false,
                texture: 'textures/blocks/water.png',
            },
            _a),
    });
    return model;
}
;
var DefaultCauldronBlockStateValues = {
    level: 0,
};
var CauldronBlock = /** @class */ (function (_super) {
    __extends(CauldronBlock, _super);
    function CauldronBlock() {
        var _this = _super.call(this, 'cauldron', [
            makeCauldronBlockModel(0),
            makeCauldronBlockModel(1),
            makeCauldronBlockModel(2),
            makeCauldronBlockModel(3),
        ]) || this;
        _this.occludesNeighborBlocks = false;
        return _this;
    }
    CauldronBlock.prototype.getBlockModel = function (blockState) {
        return blockState.get('level');
    };
    CauldronBlock.prototype.onSetBlock = function (world, pos) {
        world.setBlockState(pos, new BlockState(DefaultCauldronBlockStateValues));
    };
    CauldronBlock.prototype.onRandomTick = function (level, pos) {
        var newState = new BlockState(__assign({}, DefaultCauldronBlockStateValues));
        newState.set('level', randomElement([0, 1, 2, 3]));
        level.getWorld().setBlockState(pos, newState);
    };
    return CauldronBlock;
}(Block));
export { CauldronBlock };
