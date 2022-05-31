var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Blocks } from '../block/blocks';
import { BlockItem } from './block-item';
import { BombItem } from './bomb-item';
var Items = /** @class */ (function () {
    function Items() {
    }
    Items.getItemByName = function (name) {
        return Items.items.find(function (item) { return item.name === name; });
    };
    Items.getBlockItem = function (block) {
        var blockItem = Items.getItemByName(block.name);
        if (!blockItem) {
            throw new Error("Block item for block ".concat(block.name, " not found!"));
        }
        return blockItem;
    };
    Items.BOMB = new BombItem();
    Items.items = __spreadArray([
        Items.BOMB
    ], Blocks.listBlocks().map(function (block) { return new BlockItem(block); }), true);
    return Items;
}());
export { Items };
