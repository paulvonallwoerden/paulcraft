import { Vector2 } from 'three';
var UiElement = /** @class */ (function () {
    function UiElement(uiInterface) {
        this.uiInterface = uiInterface;
        this.id = UiElement.nextId++;
        this.position = new Vector2();
    }
    UiElement.prototype.onAdd = function (ui) {
        this.ui = ui;
    };
    UiElement.prototype.setPosition = function (x, y) {
        if (this.position.x === x && this.position.y === y) {
            return;
        }
        this.position.set(x, y);
        this.setDirty();
    };
    UiElement.prototype.setDirty = function () {
        this.uiInterface.flagElementDirty(this.id);
    };
    UiElement.prototype.register = function (parent) { };
    UiElement.prototype.unregister = function (parent) { };
    UiElement.nextId = 0;
    return UiElement;
}());
export { UiElement };
