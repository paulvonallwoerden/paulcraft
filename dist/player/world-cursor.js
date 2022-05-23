var _a;
import { BoxGeometry, Mesh, Object3D, Vector3 } from 'three';
import { BlockFace } from '../block/block-face';
import { BlockModelRenderer } from '../block/block-model/block-model-renderer';
import { computeBoundingBox } from '../util/bounding-box';
import { createWorldCursorMaterial } from './world-cursor-material';
var BLOCK_CURSOR_SOLIDITY_MAP = (_a = {},
    _a[BlockFace.TOP] = false,
    _a[BlockFace.BOTTOM] = false,
    _a[BlockFace.LEFT] = false,
    _a[BlockFace.RIGHT] = false,
    _a[BlockFace.FRONT] = false,
    _a[BlockFace.BACK] = false,
    _a);
var BlockCursorOverlap = 0.05;
var WorldCursor = /** @class */ (function () {
    function WorldCursor(blocks) {
        this.material = createWorldCursorMaterial();
        this.parent = new Object3D();
        var elementFromToModifier = function (_a) {
            var from = _a[0], to = _a[1];
            return [
                from.map(function (value) { return value - BlockCursorOverlap; }),
                to.map(function (value) { return value + BlockCursorOverlap; }),
            ];
        };
        this.blockModelRenderer = new BlockModelRenderer(blocks.serializeBlockModels().textureUvs, elementFromToModifier);
    }
    WorldCursor.prototype.register = function (scene) {
        scene.add(this.parent);
    };
    WorldCursor.prototype.set = function (world, pos) {
        this.hide();
        var block = world.getBlock(pos);
        var state = world.getBlockState(pos);
        if (!block) {
            return;
        }
        var modelIndex = state ? block.getBlockModel(state) : 0;
        var model = block.blockModels[modelIndex];
        var modelMesh = this.blockModelRenderer.render(new Vector3(pos.x, pos.y, pos.z), model, BLOCK_CURSOR_SOLIDITY_MAP);
        var points = [];
        for (var i = 0; i < modelMesh.vertices.length; i += 3) {
            points.push(new Vector3(modelMesh.vertices[i], modelMesh.vertices[i + 1], modelMesh.vertices[i + 2]));
        }
        var boundingBox = computeBoundingBox(points);
        var _a = boundingBox.getSize(new Vector3()).toArray(), width = _a[0], height = _a[1], depth = _a[2];
        var boundingBoxGeometry = new BoxGeometry(width, height, depth);
        var mesh = new Mesh(boundingBoxGeometry, this.material);
        mesh.position.x = boundingBox.min.x + width / 2;
        mesh.position.y = boundingBox.min.y + height / 2;
        mesh.position.z = boundingBox.min.z + depth / 2;
        this.parent.add(mesh);
    };
    WorldCursor.prototype.hide = function () {
        this.parent.clear();
    };
    return WorldCursor;
}());
export { WorldCursor };
