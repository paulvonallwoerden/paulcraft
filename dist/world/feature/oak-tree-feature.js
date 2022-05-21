import { Vector3 } from "three";
import { OAK_LEAVES_BLOCK_ID, OAK_LOG_BLOCK_ID } from "../../block/block-ids";
import { indexToXZY } from "../../util/index-to-vector3";
var OakTreeFeature = /** @class */ (function () {
    function OakTreeFeature() {
    }
    OakTreeFeature.prototype.place = function (_a, builder) {
        var x = _a[0], y = _a[1], z = _a[2];
        var leavesBaseOffset = new Vector3(x - 2, y + 3, z - 2);
        for (var i = 0; i < 50; i++) {
            builder.setBlock(indexToXZY(i, 5, 5).add(leavesBaseOffset).toArray(), OAK_LEAVES_BLOCK_ID);
        }
        var leavesTopOffset = new Vector3(x - 1, y + 5, z - 1);
        for (var i = 0; i < 9; i++) {
            builder.setBlock(indexToXZY(i, 3, 3).add(leavesTopOffset).toArray(), OAK_LEAVES_BLOCK_ID);
        }
        builder.setBlock([x, y + 6, z], OAK_LEAVES_BLOCK_ID);
        builder.setBlock([x - 1, y + 6, z], OAK_LEAVES_BLOCK_ID);
        builder.setBlock([x + 1, y + 6, z], OAK_LEAVES_BLOCK_ID);
        builder.setBlock([x, y + 6, z - 1], OAK_LEAVES_BLOCK_ID);
        builder.setBlock([x, y + 6, z + 1], OAK_LEAVES_BLOCK_ID);
        for (var i = 0; i < 5; i++) {
            builder.setBlock([x, y + i, z], OAK_LOG_BLOCK_ID);
        }
    };
    return OakTreeFeature;
}());
export { OakTreeFeature };
