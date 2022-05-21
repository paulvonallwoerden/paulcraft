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
var BlockModelRenderer = /** @class */ (function () {
    function BlockModelRenderer(blockUvs) {
        this.blockUvs = blockUvs;
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
        if (modelFace.cull && solidityMap[blockFace] === true) {
            return mesh;
        }
        // Vertices
        var _g = this.normalizeToFrom(element.from, element.to), _h = _g[0], fromX = _h[0], fromY = _h[1], fromZ = _h[2], _j = _g[1], toX = _j[0], toY = _j[1], toZ = _j[2];
        var _k = [toX - fromX, toY - fromY, toZ - fromZ], sizeX = _k[0], sizeY = _k[1], sizeZ = _k[2];
        var rts = this.makeTrsMatrixFromBlockModelRotation(blockModel.rotation).multiply(new Matrix4().compose(new Vector3(fromX / 15, fromY / 15, fromZ / 15), new Quaternion().identity(), new Vector3(sizeX / 15, sizeY / 15, sizeZ / 15)).multiply(FaceTrsMatrices[blockFace]));
        (_a = mesh.vertices).push.apply(_a, __spreadArray(__spreadArray(__spreadArray(__spreadArray([], new Vector3(0, 0, 0).applyMatrix4(rts).add(position).toArray(), false), new Vector3(1, 0, 0).applyMatrix4(rts).add(position).toArray(), false), new Vector3(0, 1, 0).applyMatrix4(rts).add(position).toArray(), false), new Vector3(1, 1, 0).applyMatrix4(rts).add(position).toArray(), false));
        // Triangles
        var triangleOffset = (mesh.vertices.length / 3) - 4;
        mesh.triangles.push(triangleOffset, triangleOffset + 1, triangleOffset + 2, triangleOffset + 2, triangleOffset + 1, triangleOffset + 3);
        // Normals
        for (var i = 0; i < 4; i++) {
            (_b = mesh.normals).push.apply(_b, FaceNormals[blockFace]);
        }
        // UVs
        var texture = modelFace.texture;
        var _l = [sizeX / 16, sizeY / 16, sizeZ / 16], uvScaleX = _l[0], uvScaleY = _l[1], uvScaleZ = _l[2];
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
