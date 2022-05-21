var Block = /** @class */ (function () {
    function Block(name, blockModels) {
        this.name = name;
        this.blockModels = blockModels;
    }
    Block.prototype.onRandomTick = function (level, pos) { };
    return Block;
}());
export { Block };
