import { Vector3, Vector3Tuple } from "three";
import { OAK_LEAVES_BLOCK_ID, OAK_LOG_BLOCK_ID } from "../../block/block-ids";
import { indexToXZY } from "../../util/index-to-vector3";
import { WorldFeature, WorldFeatureBuilder } from "./world-feature";

export class OakTreeFeature implements WorldFeature {
    public place([x, y, z]: Vector3Tuple, builder: WorldFeatureBuilder): void {
        const leavesBaseOffset = new Vector3(x - 2, y + 3, z - 2);
        for (let i = 0; i < 50; i++) {
            builder.setBlock(
                indexToXZY(i, 5, 5).add(leavesBaseOffset).toArray(),
                OAK_LEAVES_BLOCK_ID,
            );
        }

        const leavesTopOffset = new Vector3(x - 1, y + 5, z - 1);
        for (let i = 0; i < 9; i++) {
            builder.setBlock(
                indexToXZY(i, 3, 3).add(leavesTopOffset).toArray(),
                OAK_LEAVES_BLOCK_ID,
            );
        }

        builder.setBlock([x, y + 6, z], OAK_LEAVES_BLOCK_ID);
        builder.setBlock([x - 1, y + 6, z], OAK_LEAVES_BLOCK_ID);
        builder.setBlock([x + 1, y + 6, z], OAK_LEAVES_BLOCK_ID);
        builder.setBlock([x, y + 6, z - 1], OAK_LEAVES_BLOCK_ID);
        builder.setBlock([x, y + 6, z + 1], OAK_LEAVES_BLOCK_ID);

        for (let i = 0; i < 5; i++) {
            builder.setBlock([x, y + i, z], OAK_LOG_BLOCK_ID);
        }
    }
}
