var UiInterface = /** @class */ (function () {
    function UiInterface() {
        this.dirtyElements = [];
    }
    UiInterface.prototype.init = function (uiManager) {
        this.getElements().forEach(function (element) { return element.onAdd(uiManager); });
    };
    UiInterface.prototype.onAfterDraw = function (uiManager, screenSize) {
        var _this = this;
        this.getElements().forEach(function (element) {
            if (!_this.dirtyElements.includes(element.id)) {
                return;
            }
            element.draw(uiManager, screenSize);
        });
        this.dirtyElements = [];
    };
    UiInterface.prototype.flagElementDirty = function (elementId) {
        this.dirtyElements.push(elementId);
    };
    return UiInterface;
}());
export { UiInterface };
