var Block = /** @class */ (function () {
    function Block(name, blockModels) {
        this.name = name;
        this.blockModels = blockModels;
    }
    Block.prototype.getBlockModel = function (blockState) { return 0; };
    Block.prototype.onRandomTick = function (level, pos) { };
    Block.prototype.onSetBlock = function (world, pos) { };
    Block.prototype.onPlace = function (world, pos) { return true; };
    Block.prototype.onBreak = function (world, pos) { };
    Block.prototype.onInteract = function (world, pos) { return false; };
    Block.prototype.isCollidable = function (world, pos) { return true; };
    return Block;
}());
export { Block };
