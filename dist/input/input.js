var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
export var LeftMouseButton = 'mouse:0';
export var RightMouseButton = 'mouse:2';
var Input = /** @class */ (function () {
    function Input(domElement) {
        this.domElement = domElement;
        this.pressedKeys = {};
        this.downedKeys = {};
        this.currentMouseDelta = [0, 0];
        this.calculatedMouseDelta = [0, 0];
        domElement.addEventListener('keydown', this.onKeyDown.bind(this));
        domElement.addEventListener('keyup', this.onKeyUp.bind(this));
        domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
    Input.prototype.isKeyPressed = function (key) {
        return this.pressedKeys[key.toLowerCase()] === true;
    };
    /**
     * Like isKeyPressed but only returns true for the frame the key was pressed.
     */
    Input.prototype.isKeyDowned = function (key) {
        return this.downedKeys[key.toLowerCase()] === true;
    };
    Input.prototype.getMouseDelta = function () {
        return this.calculatedMouseDelta;
    };
    Input.prototype.lateUpdate = function () {
        this.calculatedMouseDelta = this.currentMouseDelta;
        this.currentMouseDelta = [0, 0];
        this.downedKeys = Object.keys(this.downedKeys).reduce(function (obj, key) {
            var _a;
            return (__assign(__assign({}, obj), (_a = {}, _a[key] = false, _a)));
        }, {});
    };
    Input.prototype.onMouseMove = function (event) {
        this.currentMouseDelta = [
            this.currentMouseDelta[0] + event.movementX,
            this.currentMouseDelta[1] + event.movementY,
        ];
    };
    Input.prototype.onMouseDown = function (event) {
        this.setKey("mouse:".concat(event.button));
    };
    Input.prototype.onMouseUp = function (event) {
        this.unsetKey("mouse:".concat(event.button));
    };
    Input.prototype.onKeyDown = function (event) {
        this.setKey(event.key);
    };
    Input.prototype.onKeyUp = function (event) {
        this.unsetKey(event.key);
    };
    Input.prototype.setKey = function (key) {
        this.pressedKeys[key.toLowerCase()] = true;
        if (this.downedKeys[key.toLowerCase()] === undefined) {
            this.downedKeys[key.toLowerCase()] = true;
        }
    };
    Input.prototype.unsetKey = function (key) {
        this.pressedKeys[key.toLowerCase()] = false;
        delete this.downedKeys[key.toLowerCase()];
    };
    return Input;
}());
export { Input };
