import { Texture } from "three";
import { BarrelTextureBlock, Block, MultiTextureBlock, UniTextureBlock } from "./block";
import { BlockFace, BlockFaces } from "./block-face";
import { DIRT_BLOCK_ID, GRASS_BLOCK_ID, OAK_LEAVES_BLOCK_ID, OAK_LOG_BLOCK_ID, SAND_BLOCK_ID, STONE_BLOCK_ID, WATER_BLOCK_ID } from "./block-ids";
import { TextureAtlas } from "./texture-atlas";

export interface SerializedBlockUvs {
    [blockId: number]: Record<BlockFace, number[]>;
}

export const StoneBlock = new UniTextureBlock(STONE_BLOCK_ID, 'textures/blocks/stone.png');
export const GrassBlock = new MultiTextureBlock(
    GRASS_BLOCK_ID,
    {
        [BlockFace.TOP]: 'textures/blocks/grass_block_top.png',
        [BlockFace.BOTTOM]: 'textures/blocks/dirt.png',
        [BlockFace.LEFT]: 'textures/blocks/grass_block_side.png',
        [BlockFace.RIGHT]: 'textures/blocks/grass_block_side.png',
        [BlockFace.FRONT]: 'textures/blocks/grass_block_side.png',
        [BlockFace.BACK]: 'textures/blocks/grass_block_side.png',
    },
);
export const DirtBlock = new UniTextureBlock(DIRT_BLOCK_ID, 'textures/blocks/dirt.png');
export const WaterBlock = new UniTextureBlock(WATER_BLOCK_ID, 'textures/blocks/light_blue_wool.png');
export const SandBlock = new UniTextureBlock(SAND_BLOCK_ID, 'textures/blocks/sand.png');
export const OakLogBlock = new BarrelTextureBlock(OAK_LOG_BLOCK_ID, 'textures/blocks/oak_log_top.png', 'textures/blocks/oak_log.png');
export const OakLeavesBlock = new UniTextureBlock(OAK_LEAVES_BLOCK_ID, 'textures/blocks/oak_leaves_color.png');

export class Blocks {
    private readonly blocksById: Record<number, Block>;
    private readonly textureAtlas: TextureAtlas;
    private readonly textureAtlasIndexMap: Record<string, number>;

    public constructor(private readonly blocks: Block[]) {
        this.blocksById = blocks.reduce((dict, block) => ({ ...dict, [block.id]: block }), {});

        const blockTextures = blocks.map((block) => block.getTextures()).flat();
        this.textureAtlas = new TextureAtlas(blockTextures);

        this.textureAtlasIndexMap = {};
        for (let i = 0; i < blockTextures.length; i++) {
            this.textureAtlasIndexMap[blockTextures[i]] = i;
        }
    }

    public async init() {
        await this.textureAtlas.buildAtlas();
    }

    public getBlockById(id: number) {
        return this.blocksById[id];
    }

    public getBlockTexture(): Texture {
        return this.textureAtlas.getAtlas();
    }

    public getBlockTextureUv(blockId: number, face: BlockFace): number[] {
        return this.textureAtlas.getTextureUv(this.textureAtlasIndexMap[this.getBlockById(blockId).getTexture(face)]);
    }

    public serializeBlockUvs(): SerializedBlockUvs {
        return this.blocks.reduce((blockFaceUvs, block) => ({
            ...blockFaceUvs,
            [block.id]: BlockFaces.reduce((faceUvs, face) => ({
                ...faceUvs,
                [face]: this.getBlockTextureUv(block.id, face),
            }), {}),
        }), {});
    }

    public getNumberOfBlocks() {
        return this.blocks.length;
    }
}
