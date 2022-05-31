export var UseAction;
(function (UseAction) {
    UseAction[UseAction["Primary"] = 0] = "Primary";
    UseAction[UseAction["Secondary"] = 1] = "Secondary";
})(UseAction || (UseAction = {}));
var Item = /** @class */ (function () {
    function Item(name, displayName) {
        this.name = name;
        this.displayName = displayName;
    }
    Item.prototype.onUse = function (action, world, player) {
        return false;
    };
    return Item;
}());
export { Item };
