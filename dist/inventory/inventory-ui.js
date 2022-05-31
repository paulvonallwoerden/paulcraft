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
import { UiInterface } from '../ui/ui-interface';
import { UiText } from '../ui/ui-text';
var InventoryUi = /** @class */ (function (_super) {
    __extends(InventoryUi, _super);
    function InventoryUi(inventory) {
        var _this = _super.call(this) || this;
        _this.inventory = inventory;
        _this.textItems = [];
        _this.selectedSlot = 0;
        for (var i = 0; i < inventory.slotCount; i++) {
            _this.textItems.push(new UiText(_this));
        }
        return _this;
    }
    InventoryUi.prototype.draw = function (screenSize) {
        var _this = this;
        this.textItems.forEach(function (text, i) {
            var stack = _this.inventory.getSlot(i);
            if (!stack) {
                text.setText('');
                return;
            }
            var line = "".concat(stack.item.displayName, " (").concat(stack.count, ")");
            text.setText("".concat(i === _this.selectedSlot ? '>>' : '', " ").concat(line));
            text.setPosition(2, i * 1.1 + 2);
        });
    };
    InventoryUi.prototype.getElements = function () {
        return this.textItems;
    };
    InventoryUi.prototype.setSelectedSlot = function (i) {
        this.selectedSlot = i;
    };
    return InventoryUi;
}(UiInterface));
export { InventoryUi };
