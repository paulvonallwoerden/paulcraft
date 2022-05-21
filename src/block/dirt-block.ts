import { Vector3 } from "three";
import { Level } from "../level";
import { Block } from "./block";
import { BlockFaces } from "./block-face";
import { BlockModel } from "./block-model/block-model";
import { BlockPos } from "./block-pos";
import { Blocks } from "./blocks";

export const DirtBlockModel: BlockModel = {
    elements: [
        {
            from: [0, 0, 0],
            to: [15, 15, 15],
            faces: BlockFaces.reduce((faces, face) => ({
                ...faces,
                [face]: {
                    cull: true,
                    texture: 'textures/blocks/dirt.png',
                },
            }), {}),
        },
    ],
}

export class DirtBlock extends Block {
    public constructor() {
        super('dirt', [DirtBlockModel]);
    }

    public onRandomTick(level: Level, pos: BlockPos): void {
        if (level.getBlockAt(new Vector3(pos.x, pos.y + 1, pos.z)) !== Blocks.AIR) {
            return;
        }

        if (this.isNearGrass(level, pos)) {
            level.setBlockAt(new Vector3(pos.x, pos.y, pos.z), Blocks.GRASS);
        }
    }

    private isNearGrass(level: Level, pos: BlockPos): boolean {
        for (let i = -1; i < 2; i++) {
            if (this.isGrassAtRelative(level, pos, { x: 1, y: i, z: 0 })) {
                return true;
            }
        }
        for (let i = -1; i < 2; i++) {
            if (this.isGrassAtRelative(level, pos, { x: -1, y: i, z: 0 })) {
                return true;
            }
        }
        for (let i = -1; i < 2; i++) {
            if (this.isGrassAtRelative(level, pos, { x: 0, y: i, z: 1 })) {
                return true;
            }
        }
        for (let i = -1; i < 2; i++) {
            if (this.isGrassAtRelative(level, pos, { x: 0, y: i, z: -1 })) {
                return true;
            }
        }

        return false;
    }

    private isGrassAtRelative(level: Level, pos: BlockPos, offset: BlockPos) {
        return level.getBlockAt(new Vector3(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z)) === Blocks.GRASS;
    }
}
