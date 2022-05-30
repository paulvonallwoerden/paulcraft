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
var _a;
import { Block } from "./block";
import { BlockFace } from "./block-face";
export var OakLogBlockModel = {
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 15, 15],
            faces: (_a = {},
                _a[BlockFace.TOP] = {
                    cull: true,
                    texture: 'textures/blocks/oak_log_top.png',
                },
                _a[BlockFace.BOTTOM] = {
                    cull: true,
                    texture: 'textures/blocks/oak_log_top.png',
                },
                _a[BlockFace.FRONT] = {
                    cull: true,
                    texture: 'textures/blocks/oak_log.png',
                },
                _a[BlockFace.BACK] = {
                    cull: true,
                    texture: 'textures/blocks/oak_log.png',
                },
                _a[BlockFace.LEFT] = {
                    cull: true,
                    texture: 'textures/blocks/oak_log.png',
                },
                _a[BlockFace.RIGHT] = {
                    cull: true,
                    texture: 'textures/blocks/oak_log.png',
                },
                _a),
        },
    ],
};
var OakLogBlock = /** @class */ (function (_super) {
    __extends(OakLogBlock, _super);
    function OakLogBlock() {
        return _super.call(this, 'oak_log', [OakLogBlockModel]) || this;
    }
    return OakLogBlock;
}(Block));
export { OakLogBlock };
