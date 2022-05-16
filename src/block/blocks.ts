import { Material, MeshStandardMaterial, Texture } from "three";
import { AirBlock, BarrelTextureBlock, Block, DirtBlock, GrassBlock, MultiTextureBlock, SugarCaneBlock, TntBlock, UniTextureBlock } from "./block";
import { BlockFace, BlockFaces } from "./block-face";
import { AIR_BLOCK_ID, BRICKS_BLOCK_ID, DIRT_BLOCK_ID, GLASS_BLOCK_ID, GRASS_BLOCK_ID, MYCELIUM_BLOCK_ID, OAK_LEAVES_BLOCK_ID, OAK_LOG_BLOCK_ID, OAK_PLANKS_BLOCK_ID, SAND_BLOCK_ID, SNOW_BLOCK_ID, STONE_BLOCK_ID, SUGAR_CANE_BLOCK_ID, TNT_BLOCK_ID, WATER_BLOCK_ID } from "./block-ids";
import { TextureAtlas } from "./texture-atlas";

export interface SerializedBlockUvs {
    [blockId: number]: Record<BlockFace, number[]>;
}

export interface SerializedBlockModels {
    [blockId: number]: {};
}

export const airBlock = new AirBlock(AIR_BLOCK_ID);
export const StoneBlock = new UniTextureBlock(STONE_BLOCK_ID, 'textures/blocks/stone.png');
export const grassBlock = new GrassBlock(
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
export const dirtBlock = new DirtBlock(DIRT_BLOCK_ID, 'textures/blocks/dirt.png');
export const WaterBlock = new UniTextureBlock(WATER_BLOCK_ID, 'textures/blocks/water.png');
export const SandBlock = new UniTextureBlock(SAND_BLOCK_ID, 'textures/blocks/sand.png');
export const OakLogBlock = new BarrelTextureBlock(OAK_LOG_BLOCK_ID, 'textures/blocks/oak_log_top.png', 'textures/blocks/oak_log.png');
export const OakLeavesBlock = new UniTextureBlock(OAK_LEAVES_BLOCK_ID, 'textures/blocks/oak_leaves_color.png');
export const SnowBlock = new UniTextureBlock(SNOW_BLOCK_ID, 'textures/blocks/snow.png');
export const MyceliumBlock = new UniTextureBlock(MYCELIUM_BLOCK_ID, 'textures/blocks/mycelium.png');
export const sugarCaneBlock = new SugarCaneBlock(SUGAR_CANE_BLOCK_ID, 'textures/blocks/sugar_cane.png');
export const GlassBlock = new UniTextureBlock(GLASS_BLOCK_ID, 'textures/blocks/glass.png');
export const OakPlanksBlock = new UniTextureBlock(OAK_PLANKS_BLOCK_ID, 'textures/blocks/oak_planks.png');
export const BricksBlock = new UniTextureBlock(BRICKS_BLOCK_ID, 'textures/blocks/bricks.png');
export const tntBlock = new TntBlock(TNT_BLOCK_ID, 'textures/blocks/tnt_side.png');

export class Blocks {
    private readonly blocksById: Record<number, Block>;
    private readonly textureAtlas: TextureAtlas;
    private readonly textureAtlasIndexMap: Record<string, number>;

    private solidMaterial = new MeshStandardMaterial({ opacity: 1, transparent: false });
    private waterMaterial = new MeshStandardMaterial({ opacity: 0.8, transparent: true });
    private transparentMaterial = new MeshStandardMaterial({ alphaTest: 0.5 });

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

        this.solidMaterial.map = this.textureAtlas.getAtlas();
        this.transparentMaterial.map = this.textureAtlas.getAtlas();
        this.waterMaterial.map = this.textureAtlas.getAtlas();
    }

    public getBlockById(id: number) {
        return this.blocksById[id];
    }

    public getBlockMaterials(): { solid: Material, transparent: Material, water: Material } {
        return {
            solid: this.solidMaterial,
            transparent: this.transparentMaterial,
            water: this.waterMaterial,
        };
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

    public serializeBlockModels(): SerializedBlockModels {
        return {};
    }

    public getNumberOfBlocks() {
        return this.blocks.length;
    }
}
