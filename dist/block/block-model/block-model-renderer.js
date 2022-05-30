var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b;
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { BlockFace, BlockFaces } from "../block-face";
var FaceNormals = (_a = {},
    _a[BlockFace.TOP] = [0, 1, 0],
    _a[BlockFace.BOTTOM] = [0, -1, 0],
    _a[BlockFace.LEFT] = [1, 0, 0],
    _a[BlockFace.RIGHT] = [-1, 0, 0],
    _a[BlockFace.FRONT] = [0, 0, 1],
    _a[BlockFace.BACK] = [0, 0, -1],
    _a);
var FaceTrsMatrices = (_b = {},
    _b[BlockFace.TOP] = new Matrix4().compose(new Vector3(0, 1, 1), new Quaternion().setFromEuler(new Euler(degToRad(-90), 0, 0), true), new Vector3(1, 1, 1)),
    _b[BlockFace.BOTTOM] = new Matrix4().compose(new Vector3(0, 0, 0), new Quaternion().setFromEuler(new Euler(degToRad(90), 0, 0), true), new Vector3(1, 1, 1)),
    _b[BlockFace.LEFT] = new Matrix4().compose(new Vector3(1, 0, 1), new Quaternion().setFromEuler(new Euler(0, degToRad(90), 0), true), new Vector3(1, 1, 1)),
    _b[BlockFace.RIGHT] = new Matrix4().compose(new Vector3(0, 0, 0), new Quaternion().setFromEuler(new Euler(0, degToRad(-90), 0), true), new Vector3(1, 1, 1)),
    _b[BlockFace.FRONT] = new Matrix4().compose(new Vector3(0, 0, 1), new Quaternion().identity(), new Vector3(1, 1, 1)),
    _b[BlockFace.BACK] = new Matrix4().compose(new Vector3(1, 0, 0), new Quaternion().setFromEuler(new Euler(0, degToRad(180), 0), true), new Vector3(1, 1, 1)),
    _b);
var DefaultElementFromToModifier = function (fromAndTo) { return fromAndTo; };
// TODO: Add caching. Recalculating the mesh for every block is not necessary.
var BlockModelRenderer = /** @class */ (function () {
    function BlockModelRenderer(blockUvs, elementFromToModifier) {
        if (elementFromToModifier === void 0) { elementFromToModifier = DefaultElementFromToModifier; }
        this.blockUvs = blockUvs;
        this.elementFromToModifier = elementFromToModifier;
    }
    BlockModelRenderer.prototype.render = function (position, blockModel, solidityMap) {
        var _this = this;
        return blockModel.elements.reduce(function (mesh, element) { return _this.renderElement(blockModel, position, element, solidityMap, mesh); }, {
            normals: [],
            triangles: [],
            uv: [],
            vertices: [],
        });
    };
    BlockModelRenderer.prototype.renderElement = function (blockModel, position, element, solidityMap, mesh) {
        var _this = this;
        return BlockFaces.reduce(function (modifiedMesh, blockFace) {
            var modelFace = element.faces[blockFace];
            if (modelFace === undefined) {
                return modifiedMesh;
            }
            return _this.renderFace(blockModel, position, element, modelFace, blockFace, solidityMap, modifiedMesh);
        }, mesh);
    };
    BlockModelRenderer.prototype.renderFace = function (blockModel, position, element, modelFace, blockFace, solidityMap, mesh) {
        var _a, _b, _c, _d, _e, _f;
        var _g, _h, _j, _k, _l, _m;
        if (modelFace.cull && solidityMap[blockFace] === true) {
            return mesh;
        }
        // Vertices
        var _o = this.elementFromToModifier(this.normalizeToFrom(element.from, element.to)), _p = _o[0], fromX = _p[0], fromY = _p[1], fromZ = _p[2], _q = _o[1], toX = _q[0], toY = _q[1], toZ = _q[2];
        var _r = [toX - fromX, toY - fromY, toZ - fromZ], sizeX = _r[0], sizeY = _r[1], sizeZ = _r[2];
        var modelMatrix = this.makeTrsMatrixFromBlockModelRotation(blockModel.rotation);
        var elementMatrix = this.makeTrsMatrixFromBlockModelRotation(element.rotation);
        var faceMatrix = new Matrix4().compose(new Vector3(fromX / 16, fromY / 16, fromZ / 16), new Quaternion().identity(), new Vector3((sizeX + 1) / 16, (sizeY + 1) / 16, (sizeZ + 1) / 16));
        var rts = modelMatrix.clone()
            .multiply(elementMatrix)
            .multiply(faceMatrix)
            .multiply(FaceTrsMatrices[blockFace]);
        (_a = mesh.vertices).push.apply(_a, __spreadArray(__spreadArray(__spreadArray(__spreadArray([], new Vector3(0, 0, 0).applyMatrix4(rts).add(position).toArray(), false), new Vector3(1, 0, 0).applyMatrix4(rts).add(position).toArray(), false), new Vector3(0, 1, 0).applyMatrix4(rts).add(position).toArray(), false), new Vector3(1, 1, 0).applyMatrix4(rts).add(position).toArray(), false));
        // Triangles
        var triangleOffset = (mesh.vertices.length / 3) - 4;
        mesh.triangles.push(triangleOffset, triangleOffset + 1, triangleOffset + 2, triangleOffset + 2, triangleOffset + 1, triangleOffset + 3);
        var normalMatrix = new Matrix4().makeRotationFromEuler(new Euler((((_g = element.rotation) === null || _g === void 0 ? void 0 : _g.axis) === 'x' ? element.rotation.angle : 0) + (((_h = blockModel.rotation) === null || _h === void 0 ? void 0 : _h.axis) === 'x' ? blockModel.rotation.angle : 0), (((_j = element.rotation) === null || _j === void 0 ? void 0 : _j.axis) === 'y' ? element.rotation.angle : 0) + (((_k = blockModel.rotation) === null || _k === void 0 ? void 0 : _k.axis) === 'y' ? blockModel.rotation.angle : 0), (((_l = element.rotation) === null || _l === void 0 ? void 0 : _l.axis) === 'z' ? element.rotation.angle : 0) + (((_m = blockModel.rotation) === null || _m === void 0 ? void 0 : _m.axis) === 'z' ? blockModel.rotation.angle : 0)));
        var normal = new Vector3().fromArray(FaceNormals[blockFace]).applyMatrix4(normalMatrix);
        for (var i = 0; i < 4; i++) {
            (_b = mesh.normals).push.apply(_b, normal.normalize().toArray());
        }
        // UVs
        var texture = modelFace.texture;
        var _s = [(sizeX + 1) / 16, (sizeY + 1) / 16, (sizeZ + 1) / 16], uvScaleX = _s[0], uvScaleY = _s[1], uvScaleZ = _s[2];
        var uvs = this.blockUvs[texture];
        switch (blockFace) {
            case BlockFace.FRONT:
            case BlockFace.BACK:
                (_c = mesh.uv).push.apply(_c, this.scaleUvs(uvs, [0, 0], [uvScaleX, uvScaleY]));
                break;
            case BlockFace.LEFT:
            case BlockFace.RIGHT:
                (_d = mesh.uv).push.apply(_d, this.scaleUvs(uvs, [0, 0], [uvScaleZ, uvScaleY]));
                break;
            case BlockFace.TOP:
            case BlockFace.BOTTOM:
                (_e = mesh.uv).push.apply(_e, this.scaleUvs(uvs, [0, 0], [uvScaleX, uvScaleZ]));
                break;
            default:
                (_f = mesh.uv).push.apply(_f, uvs);
                break;
        }
        return mesh;
    };
    // TODO: This method sucks. It's hard to understand. Make it better.
    BlockModelRenderer.prototype.scaleUvs = function (uvs, offset, scale) {
        return [
            offset[0] + uvs[0], offset[1] + uvs[1],
            offset[0] + uvs[2] - (1 / 16) * (1 - scale[0]), offset[1] + uvs[3],
            offset[0] + uvs[4], offset[1] + uvs[5] - (1 / 16) * (1 - scale[1]),
            offset[0] + uvs[6] - (1 / 16) * (1 - scale[0]), offset[1] + uvs[7] - (1 / 16) * (1 - scale[1]),
        ];
    };
    BlockModelRenderer.prototype.makeTrsMatrixFromBlockModelRotation = function (rotation) {
        if (rotation === undefined) {
            return new Matrix4().identity();
        }
        var rotationMatrix = new Matrix4().makeRotationAxis(new Vector3(rotation.axis === 'x' ? 1 : 0, rotation.axis === 'y' ? 1 : 0, rotation.axis === 'z' ? 1 : 0), degToRad(rotation.angle));
        if (rotation.origin === undefined) {
            return rotationMatrix;
        }
        var _a = rotation.origin, originX = _a[0], originY = _a[1], originZ = _a[2];
        var shiftMatrix = new Matrix4().makeTranslation(originX, originY, originZ);
        var deShiftMatrix = new Matrix4().makeTranslation(-originX, -originY, -originZ);
        return shiftMatrix.multiply(rotationMatrix).multiply(deShiftMatrix);
    };
    BlockModelRenderer.prototype.normalizeToFrom = function (from, to) {
        return [
            [Math.min(from[0], to[0]), Math.min(from[1], to[1]), Math.min(from[2], to[2])],
            [Math.max(from[0], to[0]), Math.max(from[1], to[1]), Math.max(from[2], to[2])],
        ];
    };
    return BlockModelRenderer;
}());
export { BlockModelRenderer };
