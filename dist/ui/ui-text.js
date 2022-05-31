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
import { Mesh } from 'three';
import { UiElement } from './ui-element';
var UiText = /** @class */ (function (_super) {
    __extends(UiText, _super);
    function UiText() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mesh = new Mesh();
        _this.text = 'New Text';
        _this.width = 0;
        return _this;
    }
    UiText.prototype.setText = function (text) {
        if (this.text === text) {
            return;
        }
        this.text = text;
        this.setDirty();
    };
    UiText.prototype.draw = function (ui, screenSize) {
        var _a = ui.fontRenderer.render(this.text), geometry = _a.geometry, width = _a.width;
        this.width = width;
        this.mesh.geometry = geometry;
        this.mesh.material = ui.textMaterial;
        this.mesh.position.set(this.position.x, this.position.y, 0);
    };
    UiText.prototype.onAdd = function (ui) {
        ui.addMesh(this.mesh);
    };
    UiText.prototype.getTextWidth = function () {
        return this.width;
    };
    return UiText;
}(UiElement));
export { UiText };
