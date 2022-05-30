var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Vector3 } from "three";
import { computeBoundingBox } from "../../util/bounding-box";
import { xyzTupelToIndex } from "../../util/index-to-vector3";
export function buildFeatureVariant(variant) {
    var elements = variant.elements;
    var boundingBox = getFeatureVariantBoundingBox(variant);
    var _a = boundingBox.min.toArray(), minX = _a[0], minY = _a[1], minZ = _a[2];
    var _b = boundingBox.getSize(new Vector3()).add(new Vector3(1, 1, 1)).toArray(), width = _b[0], height = _b[1], depth = _b[2];
    var blocks = [];
    elements.forEach(function (element) {
        if ('at' in element) {
            var _a = element.at, x = _a[0], y = _a[1], z = _a[2];
            blocks[xyzTupelToIndex(x - minX, y - minY, z - minZ, width, depth)] = element.block;
            return;
        }
        var _b = element.from, x1 = _b[0], y1 = _b[1], z1 = _b[2];
        var _c = element.to, x2 = _c[0], y2 = _c[1], z2 = _c[2];
        for (var x = x1; x <= x2; x++) {
            for (var y = y1; y <= y2; y++) {
                for (var z = z1; z <= z2; z++) {
                    blocks[xyzTupelToIndex(x - minX, y - minY, z - minZ, width, depth)] = element.block;
                }
            }
        }
    });
    return { blocks: blocks, width: width, height: height, depth: depth };
}
function getFeatureVariantBoundingBox(variant) {
    var elements = variant.elements;
    var points = elements.reduce(function (points, element) {
        if ('at' in element) {
            return __spreadArray(__spreadArray([], points, true), [new Vector3().fromArray(element.at)], false);
        }
        return __spreadArray(__spreadArray([], points, true), [new Vector3().fromArray(element.from), new Vector3().fromArray(element.to)], false);
    }, []);
    return computeBoundingBox(points);
}
// Tree
// Cactus
// Grass
// Flower
// Pumpkins
