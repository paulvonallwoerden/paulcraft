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
import { Block } from "./block";
import { BlockFaces } from "./block-face";
export var LeavesBlockModel = {
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 15, 15],
            faces: BlockFaces.reduce(function (faces, face) {
                var _a;
                return (__assign(__assign({}, faces), (_a = {}, _a[face] = {
                    texture: 'textures/blocks/oak_leaves.png',
                }, _a)));
            }, {}),
        },
    ],
};
var LeavesBlock = /** @class */ (function (_super) {
    __extends(LeavesBlock, _super);
    function LeavesBlock() {
        var _this = _super.call(this, 'leaves', [LeavesBlockModel]) || this;
        _this.isFoliage = true;
        _this.blocksLight = false;
        return _this;
    }
    return LeavesBlock;
}(Block));
export { LeavesBlock };
