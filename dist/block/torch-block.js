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
import { Block } from './block';
import { BlockFace } from './block-face';
import { BlockState } from './block-state/block-state';
import { Blocks } from './blocks';
var StandingTorchBlockModel = {
    elements: [
        {
            from: [7, 0, 7],
            to: [8, 9, 8],
            faces: (_a = {},
                _a[BlockFace.TOP] = {
                    texture: 'textures/blocks/tnt_top.png',
                },
                _a[BlockFace.BOTTOM] = {
                    texture: 'textures/blocks/oak_log_top.png',
                },
                _a[BlockFace.FRONT] = {
                    texture: 'textures/blocks/oak_log.png',
                },
                _a[BlockFace.BACK] = {
                    texture: 'textures/blocks/oak_log.png',
                },
                _a[BlockFace.LEFT] = {
                    texture: 'textures/blocks/oak_log.png',
                },
                _a[BlockFace.RIGHT] = {
                    texture: 'textures/blocks/oak_log.png',
                },
                _a),
        },
    ],
};
function makeHangingTorchBlockModel(angle) {
    var _a;
    return {
        rotation: {
            axis: 'y',
            angle: angle,
            origin: [0.5, 0, 0.5],
        },
        elements: [
            {
                from: [7, 4, 0],
                to: [8, 13, 1],
                rotation: {
                    axis: 'x',
                    angle: 20,
                    origin: [0, 0.5, 0],
                },
                faces: (_a = {},
                    _a[BlockFace.TOP] = {
                        texture: 'textures/blocks/tnt_top.png',
                    },
                    _a[BlockFace.BOTTOM] = {
                        texture: 'textures/blocks/oak_log_top.png',
                    },
                    _a[BlockFace.FRONT] = {
                        texture: 'textures/blocks/oak_log.png',
                    },
                    _a[BlockFace.BACK] = {
                        texture: 'textures/blocks/oak_log.png',
                    },
                    _a[BlockFace.LEFT] = {
                        texture: 'textures/blocks/oak_log.png',
                    },
                    _a[BlockFace.RIGHT] = {
                        texture: 'textures/blocks/oak_log.png',
                    },
                    _a),
            },
        ],
    };
}
var DefaultTorchBlockStateValues = {
    standing: true,
    facing: 0,
};
var TorchBlock = /** @class */ (function (_super) {
    __extends(TorchBlock, _super);
    function TorchBlock() {
        var _this = _super.call(this, 'torch', [
            StandingTorchBlockModel,
            makeHangingTorchBlockModel(0),
            makeHangingTorchBlockModel(90),
            makeHangingTorchBlockModel(180),
            makeHangingTorchBlockModel(270),
        ]) || this;
        _this.blocksLight = false;
        _this.occludesNeighborBlocks = false;
        return _this;
    }
    TorchBlock.prototype.onSetBlock = function (world, pos) {
        var existingState = world.getBlockState(pos);
        if (existingState !== undefined) {
            return;
        }
        world.setBlockState(pos, new BlockState(__assign({}, DefaultTorchBlockStateValues)));
    };
    TorchBlock.prototype.onPlace = function (player, world, pos) {
        var facing = player.getFacingDirection();
        var standing = world.getBlock({ x: pos.x, y: pos.y - 1, z: pos.z }) !== Blocks.AIR;
        world.setBlockState(pos, new BlockState({ standing: standing, facing: facing }));
        return true;
    };
    TorchBlock.prototype.getBlockModel = function (state) {
        if (state.get('standing')) {
            return 0;
        }
        return 1 + state.get('facing');
    };
    TorchBlock.prototype.getLightLevel = function () {
        return 15;
    };
    TorchBlock.prototype.isCollidable = function () {
        return false;
    };
    return TorchBlock;
}(Block));
export { TorchBlock };
