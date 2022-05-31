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
import { sumBlockPos } from '../block/block-pos';
import { Blocks } from '../block/blocks';
import { manhattenDistance } from '../light/flood-fill';
import { indexToPos } from '../util/index-to-vector3';
import { Item, UseAction } from './item';
var BLAST_DIAMETER = 32;
var BombItem = /** @class */ (function (_super) {
    __extends(BombItem, _super);
    function BombItem() {
        return _super.call(this, 'bomb', 'Bomb') || this;
    }
    BombItem.prototype.onUse = function (action, world, player) {
        if (action !== UseAction.Primary) {
            return false;
        }
        var facing = player.getFacingBlock();
        if (!facing) {
            return false;
        }
        var originPos = facing.pos, point = facing.point;
        for (var i = 0; i < BLAST_DIAMETER * BLAST_DIAMETER * BLAST_DIAMETER; i++) {
            var pos = indexToPos(i, BLAST_DIAMETER).subScalar(BLAST_DIAMETER / 2);
            var dist = manhattenDistance({ x: 0, y: 0, z: 0 }, pos);
            if (dist > BLAST_DIAMETER / 2) {
                continue;
            }
            var worldPos = sumBlockPos(pos, originPos);
            world.setBlock(worldPos, Blocks.AIR);
        }
        world.playSound3D('generic.explosion', point);
        return true;
    };
    return BombItem;
}(Item));
export { BombItem };
