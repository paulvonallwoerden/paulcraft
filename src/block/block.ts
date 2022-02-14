import { BufferGeometry, Material, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from "three";
import { Level } from "../level";
import { World } from "../world/world";
import { BlockFace } from "./block-face";
import { AIR_BLOCK_ID, DIRT_BLOCK_ID, GRASS_BLOCK_ID, SUGAR_CANE_BLOCK_ID } from "./block-ids";
import { BlockPos } from "./block-pos";

export enum BlockRenderMode {
    Solid,
    CustomMesh,
}

export abstract class Block {
    public readonly renderMode: BlockRenderMode = BlockRenderMode.Solid;

    public constructor(public readonly id: number) {}

    public abstract getTexture(face: BlockFace): string;
    public abstract getTextures(): string[];

    public onTick(world: Level, pos: BlockPos): void {}

    public getCustomMesh(): Mesh | undefined {
        return undefined;
    }
}

export class AirBlock extends Block {
    public getTexture(): string {
        return '';
    }

    public getTextures(): string[] {
        return [];
    }
}


export class UniTextureBlock extends Block {
    public constructor(
        readonly id: number,
        private readonly textureSrc: string,
    ) {
        super(id);
    }

    public getTexture(): string {
        return this.textureSrc;
    }

    public getTextures(): string[] {
        return [this.textureSrc];
    }
}

export class MultiTextureBlock extends Block {
    public constructor(
        readonly id: number,
        private readonly textureSources: Record<BlockFace, string>,
    ) {
        super(id);
    }

    public getTexture(face: BlockFace): string {
        return this.textureSources[face];
    }

    public getTextures(): string[] {
        return Object.values(this.textureSources);
    }
}

export class BarrelTextureBlock extends Block {
    public constructor(
        readonly id: number,
        private readonly topBottomTextureSource: string,
        private readonly sideTextureSource: string,
    ) {
        super(id);
    }

    public getTexture(face: BlockFace): string {
        return face === BlockFace.TOP || face === BlockFace.BOTTOM ? this.topBottomTextureSource : this.sideTextureSource;
    }

    public getTextures(): string[] {
        return [this.topBottomTextureSource, this.sideTextureSource];
    }
}

export class GrassBlock extends MultiTextureBlock {
    public onTick(level: Level, pos: BlockPos): void {
        if (level.getBlockAt(new Vector3(pos.x, pos.y + 1, pos.z)) === AIR_BLOCK_ID) {
            return;
        }

        level.setBlockAt(new Vector3(pos.x, pos.y, pos.z), DIRT_BLOCK_ID);
    }
}

export class DirtBlock extends UniTextureBlock {
    public onTick(level: Level, pos: BlockPos): void {
        if (level.getBlockAt(new Vector3(pos.x, pos.y + 1, pos.z)) !== AIR_BLOCK_ID) {
            return;
        }

        if (this.isNearGrass(level, pos)) {
            level.setBlockAt(new Vector3(pos.x, pos.y, pos.z), GRASS_BLOCK_ID);
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
        return level.getBlockAt(new Vector3(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z)) === GRASS_BLOCK_ID;
    }
}


export class SugarCaneBlock extends UniTextureBlock {
    public readonly renderMode = BlockRenderMode.CustomMesh;

    private readonly maxGrowHeight = 3;

    public onTick(level: Level, pos: BlockPos): void {
        const growthPosition = new Vector3(pos.x, pos.y + 1, pos.z);
        if (level.getBlockAt(growthPosition) !== AIR_BLOCK_ID) {
            return;
        }
        let height = 1;
        for (let i = 1; i < this.maxGrowHeight; i++) {
            const block = level.getBlockAt(new Vector3(pos.x, pos.y - i, pos.z));
            if (block !== SUGAR_CANE_BLOCK_ID) {
                break;
            }

            height++;
        }

        if (height < this.maxGrowHeight) {
            level.setBlockAt(growthPosition, SUGAR_CANE_BLOCK_ID);
        }
    }

    public getCustomMesh(): Mesh<BufferGeometry, Material | Material[]> | undefined {
        const geometry = new SphereGeometry(0.2, 4, 4);
        const material = new MeshStandardMaterial({ color: 'ef35de' });
        const mesh = new Mesh(geometry, material);

        return mesh;
     }
}
