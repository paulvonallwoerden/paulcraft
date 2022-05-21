import { BoxGeometry, Mesh, Object3D } from "three";
import { createWorldCursorMaterial } from "./world-cursor-material";
var WorldCursor = /** @class */ (function () {
    function WorldCursor() {
        this.overlap = 0.001;
        this.material = createWorldCursorMaterial();
        this.parent = new Object3D();
    }
    WorldCursor.prototype.register = function (scene) {
        scene.add(this.parent);
    };
    WorldCursor.prototype.set = function (world, pos) {
        var _a;
        this.hide();
        var block = world.getBlock(pos);
        var state = world.getBlockState(pos);
        if (!block) {
            return;
        }
        var modelIndex = state ? block.getBlockModel(state) : 0;
        var model = block.blockModels[modelIndex];
        var meshes = this.buildMeshes(model, pos);
        (_a = this.parent).add.apply(_a, meshes);
    };
    WorldCursor.prototype.hide = function () {
        this.parent.clear();
    };
    WorldCursor.prototype.buildMeshes = function (model, pos) {
        var _this = this;
        return model.elements.map(function (element) {
            var _a = _this.normalizeToFrom(element.from, element.to), from = _a[0], to = _a[1];
            var _b = [
                (to[0] - from[0]) / 15 + _this.overlap * 2,
                (to[1] - from[1]) / 15 + _this.overlap * 2,
                (to[2] - from[2]) / 15 + _this.overlap * 2,
            ], width = _b[0], height = _b[1], depth = _b[2];
            var newGeometry = new BoxGeometry(width, height, depth);
            newGeometry.translate((pos.x + width / 2) + from[0] / 15 - _this.overlap, (pos.y + height / 2) + from[1] / 15 - _this.overlap, (pos.z + depth / 2) + from[2] / 15 - _this.overlap);
            return new Mesh(newGeometry, _this.material);
        });
    };
    WorldCursor.prototype.normalizeToFrom = function (from, to) {
        return [
            [Math.min(from[0], to[0]), Math.min(from[1], to[1]), Math.min(from[2], to[2])],
            [Math.max(from[0], to[0]), Math.max(from[1], to[1]), Math.max(from[2], to[2])],
        ];
    };
    return WorldCursor;
}());
export { WorldCursor };
