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
import { normalByBlockFace } from '../block/block-face';
import { floorBlockPos } from '../block/block-pos';
import { Blocks } from '../block/blocks';
import { Item, UseAction } from './item';
var BlockItem = /** @class */ (function (_super) {
    __extends(BlockItem, _super);
    function BlockItem(block) {
        var _this = _super.call(this, block.name, block.displayName) || this;
        _this.block = block;
        return _this;
    }
    BlockItem.prototype.onUse = function (action, world, player) {
        var facingBlock = player.getFacingBlock();
        if (!facingBlock) {
            return false;
        }
        var block = facingBlock.block, face = facingBlock.face, pos = facingBlock.pos, point = facingBlock.point;
        if (action === UseAction.Primary) {
            world.setBlock(pos, Blocks.AIR);
            block.onBreak(world, pos);
            return true;
        }
        player.inventory.take(this);
        var normal = normalByBlockFace(face);
        var placePos = floorBlockPos({ x: point.x + normal.x * 0.1, y: point.y + normal.y * 0.1, z: point.z + normal.z * 0.1 });
        world.setBlock(placePos, this.block);
        this.block.onPlace(player, world, placePos);
        return true;
    };
    return BlockItem;
}(Item));
export { BlockItem };
