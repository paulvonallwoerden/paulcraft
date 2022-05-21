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
import { Block } from "./block";
import { BlockFaces } from "./block-face";
import { BlockState } from "./block-state/block-state";
import { Blocks } from "./blocks";
export function makeClosedDoorBlockModel(rotation, texture) {
    return {
        rotation: {
            angle: rotation,
            axis: 'y'
        },
        elements: [
            {
                from: [0, 0, 0],
                to: [2, 15, 15],
                faces: BlockFaces.reduce(function (faces, face) {
                    var _a;
                    return (__assign(__assign({}, faces), (_a = {}, _a[face] = { texture: texture }, _a)));
                }, {}),
            },
        ],
    };
}
export function makeOpenedDoorBlockModel(rotation, texture) {
    return {
        rotation: {
            angle: rotation,
            axis: 'y'
        },
        elements: [
            {
                from: [0, 0, 0],
                to: [15, 15, 2],
                faces: BlockFaces.reduce(function (faces, face) {
                    var _a;
                    return (__assign(__assign({}, faces), (_a = {}, _a[face] = { texture: texture }, _a)));
                }, {}),
            },
        ],
    };
}
var DefaultDoorBlockStateValues = { open: false, isTop: false };
var DoorBlock = /** @class */ (function (_super) {
    __extends(DoorBlock, _super);
    function DoorBlock() {
        return _super.call(this, 'door', [
            makeClosedDoorBlockModel(0, 'textures/blocks/oak_door_bottom.png'),
            makeOpenedDoorBlockModel(0, 'textures/blocks/oak_door_bottom.png'),
            makeClosedDoorBlockModel(0, 'textures/blocks/oak_door_top.png'),
            makeOpenedDoorBlockModel(0, 'textures/blocks/oak_door_top.png'),
        ]) || this;
    }
    DoorBlock.prototype.getBlockModel = function (blockState) {
        var open = blockState.get('open');
        var top = blockState.get('isTop');
        return (top ? 2 : 0) + (open ? 1 : 0);
    };
    DoorBlock.prototype.onSetBlock = function (world, pos) {
        var existingState = world.getBlockState(pos);
        if (existingState !== undefined) {
            return;
        }
        world.setBlockState(pos, new BlockState(__assign({}, DefaultDoorBlockStateValues)));
    };
    DoorBlock.prototype.onPlace = function (world, pos) {
        var topPos = __assign(__assign({}, pos), { y: pos.y + 1 });
        world.setBlockState(topPos, new BlockState(__assign(__assign({}, DefaultDoorBlockStateValues), { isTop: true })));
        world.setBlock(topPos, Blocks.DOOR);
        return true;
    };
    DoorBlock.prototype.onInteract = function (world, pos) {
        var topPos = __assign(__assign({}, pos), { y: pos.y + 1 });
        var top = world.getBlock(topPos);
        if (top instanceof DoorBlock) {
            top.toggleOpen(world, topPos);
            this.toggleOpen(world, pos);
        }
        else {
            var bottomPos = __assign(__assign({}, pos), { y: pos.y - 1 });
            var bottom = world.getBlock(bottomPos);
            if (bottom instanceof DoorBlock) {
                bottom.toggleOpen(world, bottomPos);
                this.toggleOpen(world, pos);
            }
        }
        return true;
    };
    DoorBlock.prototype.onBreak = function (world, pos) {
        var topPos = __assign(__assign({}, pos), { y: pos.y + 1 });
        var top = world.getBlock(topPos);
        if (top instanceof DoorBlock) {
            world.setBlock(topPos, Blocks.AIR);
        }
        else {
            var bottomPos = __assign(__assign({}, pos), { y: pos.y - 1 });
            var bottom = world.getBlock(bottomPos);
            if (bottom instanceof DoorBlock) {
                world.setBlock(bottomPos, Blocks.AIR);
            }
        }
    };
    DoorBlock.prototype.isCollidable = function (world, pos) {
        var state = world.getBlockState(pos);
        return !state.get('open');
    };
    DoorBlock.prototype.toggleOpen = function (world, pos) {
        var state = world.getBlockState(pos);
        state.set('open', !state.get('open'));
        world.setBlockState(pos, state);
    };
    return DoorBlock;
}(Block));
export { DoorBlock };
