import { Box3 } from "three";
export function computeBoundingBox(points) {
    var box = new Box3();
    for (var i = 0; i < points.length; i++) {
        var _a = points[i], x = _a.x, y = _a.y, z = _a.z;
        if (x < box.min.x)
            box.min.x = x;
        if (x > box.max.x)
            box.max.x = x;
        if (y < box.min.y)
            box.min.y = y;
        if (y > box.max.y)
            box.max.y = y;
        if (z < box.min.z)
            box.min.z = z;
        if (z > box.max.z)
            box.max.z = z;
    }
    return box;
}
