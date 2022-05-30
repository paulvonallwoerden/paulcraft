var Block = /** @class */ (function () {
    function Block(name, blockModels) {
        this.name = name;
        this.blockModels = blockModels;
        this.isFoliage = false;
        this.blocksLight = true;
        this.occludesNeighborBlocks = true;
    }
    Block.prototype.onRandomTick = function (level, pos) { };
    Block.prototype.getBlockModel = function (blockState) { return 0; };
    Block.prototype.getLightLevel = function () { return 0; };
    Block.prototype.onSetBlock = function (world, pos) { };
    Block.prototype.onPlace = function (player, world, pos) { return true; };
    Block.prototype.onBreak = function (world, pos) { };
    Block.prototype.onInteract = function (world, pos) { return false; };
    Block.prototype.isCollidable = function (world, pos) { return true; };
    return Block;
}());
export { Block };
