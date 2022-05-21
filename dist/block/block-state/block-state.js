var BlockState = /** @class */ (function () {
    function BlockState(values) {
        this.values = values;
    }
    BlockState.prototype.get = function (name) {
        return this.values[name];
    };
    BlockState.prototype.toJson = function () {
        return this.values;
    };
    BlockState.fromJson = function (raw) {
        return new BlockState(raw);
    };
    return BlockState;
}());
export { BlockState };
