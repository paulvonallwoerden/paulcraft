import { Box3, Vector3 } from "three";

export function computeBoundingBox(points: Vector3[]): Box3 {
    const box = new Box3();
    for (let i = 0; i < points.length; i++) {
        const { x, y, z } = points[i];
        if (x < box.min.x) box.min.x = x;
        if (x > box.max.x) box.max.x = x;
        if (y < box.min.y) box.min.y = y;
        if (y > box.max.y) box.max.y = y;
        if (z < box.min.z) box.min.z = z;
        if (z > box.max.z) box.max.z = z;
    }

    return box;
}
