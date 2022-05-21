import { Material, MeshStandardMaterial, Texture } from "three";
import { removeDuplicates } from "../util/remove-duplicates";
import { AirBlock } from "./air-block";
import { Block } from "./block";
import { BlockFace, BlockFaces } from "./block-face";
import { AIR_BLOCK_ID, BRICKS_BLOCK_ID, DIRT_BLOCK_ID, GLASS_BLOCK_ID, GRASS_BLOCK_ID, MYCELIUM_BLOCK_ID, OAK_LEAVES_BLOCK_ID, OAK_LOG_BLOCK_ID, OAK_PLANKS_BLOCK_ID, SAND_BLOCK_ID, SNOW_BLOCK_ID, STONE_BLOCK_ID, SUGAR_CANE_BLOCK_ID, TNT_BLOCK_ID, WATER_BLOCK_ID } from "./block-ids";
import { BlockModel, getBlockModelTextures } from "./block-model/block-model";
import { CauldronBlock } from "./cauldron-block";
import { DirtBlock } from "./dirt-block";
import { DoorBlock } from "./door-block";
import { GrassBlock } from "./grass-block";
import { SandBlock } from "./sand-block";
import { StoneBlock } from "./stone-block";
import { TextureAtlas } from "./texture-atlas";

export type BlockTextureToUvMap = Record<string, number[]>;

export interface SerializedBlockModels {
    textureUvs: BlockTextureToUvMap;
    blockModels: Array<BlockModel[]>;
}

export class Blocks {
    public static readonly AIR = new AirBlock();
    public static readonly STONE = new StoneBlock();
    public static readonly GRASS = new GrassBlock();
    public static readonly DIRT = new DirtBlock();
    public static readonly SAND = new SandBlock();
    public static readonly CAULDRON = new CauldronBlock();
    public static readonly DOOR = new DoorBlock();

    private static readonly blocks: Block[] = [
        Blocks.AIR,
        Blocks.STONE,
        Blocks.GRASS,
        Blocks.DIRT,
        Blocks.SAND,
        Blocks.CAULDRON,
        Blocks.DOOR,
    ];

    private textureAtlas: TextureAtlas;
    private blockTextureSources: string[];

    private solidMaterial = new MeshStandardMaterial({ opacity: 1, transparent: false });
    private waterMaterial = new MeshStandardMaterial({ opacity: 0.8, transparent: true });
    private transparentMaterial = new MeshStandardMaterial({ alphaTest: 0.5 });

    public constructor() {
        const blockTextures = Blocks.blocks.flatMap(
            (block) => block.blockModels.flatMap((blockModel) => getBlockModelTextures(blockModel)),
        );

        this.blockTextureSources = removeDuplicates(blockTextures);
        this.textureAtlas = new TextureAtlas(this.blockTextureSources);
    }

    public async init() {
        const atlas = await this.textureAtlas.buildAtlas();
        this.solidMaterial.map = atlas;
        this.transparentMaterial.map = atlas;
        this.waterMaterial.map = atlas;
    }

    public static getBlockId(block: Block): number {
        return Blocks.blocks.indexOf(block);
    }

    public static getBlockById(id: number): Block {
        return Blocks.blocks[id];
    }

    public getBlockMaterials(): { solid: Material, transparent: Material, water: Material } {
        return {
            solid: this.solidMaterial,
            transparent: this.transparentMaterial,
            water: this.waterMaterial,
        };
    }

    public getBlockTexture(texture: string): number[] {
        return this.textureAtlas!.getTextureUv(texture);
    }

    public serializeBlockModels(): SerializedBlockModels {
        return {
            textureUvs: this.blockTextureSources.reduce((uvs, source) => ({
                ...uvs,
                [source]: this.textureAtlas.getTextureUv(source),
            }), {}),
            blockModels: Blocks.blocks.map((block) => block.blockModels),
        };
    }

    public getNumberOfBlocks() {
        return Blocks.blocks.length;
    }
}
