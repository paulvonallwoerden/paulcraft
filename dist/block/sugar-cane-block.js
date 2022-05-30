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
var _a, _b;
import { Block } from "./block";
import { BlockFace } from "./block-face";
var SugarCaneBlockModel = {
    elements: [
        {
            from: [0, 0, 7.5],
            to: [15, 15, 7.5],
            rotation: {
                angle: 45,
                axis: 'y',
                origin: [0.5, 0.5, 0.5],
            },
            faces: (_a = {},
                _a[BlockFace.FRONT] = { texture: 'textures/blocks/sugar_cane.png' },
                _a[BlockFace.BACK] = { texture: 'textures/blocks/sugar_cane.png' },
                _a),
        },
        {
            from: [0, 0, 7.5],
            to: [15, 15, 7.5],
            rotation: {
                angle: -45,
                axis: 'y',
                origin: [0.5, 0.5, 0.5],
            },
            faces: (_b = {},
                _b[BlockFace.FRONT] = { texture: 'textures/blocks/sugar_cane.png' },
                _b[BlockFace.BACK] = { texture: 'textures/blocks/sugar_cane.png' },
                _b),
        },
    ],
};
var SugarCaneBlock = /** @class */ (function (_super) {
    __extends(SugarCaneBlock, _super);
    function SugarCaneBlock() {
        var _this = _super.call(this, 'sugar_cane', [SugarCaneBlockModel]) || this;
        _this.blocksLight = false;
        return _this;
    }
    SugarCaneBlock.prototype.isCollidable = function () {
        return false;
    };
    return SugarCaneBlock;
}(Block));
export { SugarCaneBlock };
