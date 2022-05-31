var ItemStack = /** @class */ (function () {
    function ItemStack(item, count) {
        if (count === void 0) { count = 1; }
        this.item = item;
        this.count = count;
    }
    return ItemStack;
}());
export { ItemStack };
