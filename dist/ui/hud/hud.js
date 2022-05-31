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
import { UiInterface } from '../ui-interface';
import { UiText } from '../ui-text';
var Hud = /** @class */ (function (_super) {
    __extends(Hud, _super);
    function Hud(player) {
        var _this = _super.call(this) || this;
        _this.player = player;
        _this.textChunkPosition = new UiText(_this);
        _this.textSelectedBlock = new UiText(_this);
        return _this;
    }
    Hud.prototype.draw = function (size) {
        this.textChunkPosition.setText("Chunk: ".concat(this.player.getChunkPosition().join(', ')));
        this.textChunkPosition.setPosition(size.x - (this.textChunkPosition.getTextWidth() + 1), size.y - 2);
        var selectedItem = this.getSelectedItem();
        if (selectedItem) {
            this.textSelectedBlock.setText("Use Q & E to select another item");
        }
        else {
            this.textSelectedBlock.setText('Your hands are empty! Press \'M\' to cheat <3');
        }
        this.textSelectedBlock.setPosition((size.x / 2) - (this.textSelectedBlock.getTextWidth() / 2), 1);
    };
    Hud.prototype.getSelectedItem = function () {
        var _a = this.player, inventory = _a.inventory, selectedInventorySlot = _a.selectedInventorySlot;
        var itemStack = inventory.getSlot(selectedInventorySlot);
        if (!itemStack) {
            return undefined;
        }
        return itemStack.item.displayName;
    };
    Hud.prototype.getElements = function () {
        return [
            this.textChunkPosition,
            this.textSelectedBlock,
        ];
    };
    return Hud;
}(UiInterface));
export { Hud };
