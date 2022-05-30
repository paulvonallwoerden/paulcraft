import { Material, MeshStandardMaterial, MultiplyBlending, ShaderMaterial } from "three";
import { makeOpaqueBlockMaterial } from "../shader/opaque-block-shader";

import { removeDuplicates } from "../util/remove-duplicates";
import { createFoliageMaterial } from "../world/foliage-material";
import { AirBlock } from "./air-block";
import { Block } from "./block";
import { BlockModel, getBlockModelTextures } from "./block-model/block-model";
import { CauldronBlock } from "./cauldron-block";
import { DirtBlock } from "./dirt-block";
import { DoorBlock } from "./door-block";
import { GrassBlock } from "./grass-block";
import { LeavesBlock } from "./leaves-block";
import { OakLogBlock } from "./log-block";
import { SandBlock } from "./sand-block";
import { StoneBlock } from "./stone-block";
import { SugarCaneBlock } from "./sugar-cane-block";
import { TextureAtlas } from "./texture-atlas";
import { TorchBlock } from "./torch-block";
import { WaterBlock } from "./water-block";

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
    public static readonly WATER = new WaterBlock();
    public static readonly SUGAR_CANE = new SugarCaneBlock();
    public static readonly LEAVES = new LeavesBlock();
    public static readonly OAK_LOG = new OakLogBlock();
    public static readonly TORCH = new TorchBlock();

    private static readonly blocks: Block[] = [
        Blocks.AIR,
        Blocks.STONE,
        Blocks.GRASS,
        Blocks.DIRT,
        Blocks.SAND,
        Blocks.CAULDRON,
        Blocks.DOOR,
        Blocks.WATER,
        Blocks.SUGAR_CANE,
        Blocks.LEAVES,
        Blocks.OAK_LOG,
        Blocks.TORCH,
    ];

    private textureAtlas: TextureAtlas;
    private blockTextureSources: string[];

    private solidMaterial?: ShaderMaterial; // =   / new MeshStandardMaterial({ opacity: 1, transparent: false });
    private waterMaterial = new MeshStandardMaterial({ opacity: 0.8, transparent: true });
    private transparentMaterial?: Material;

    public constructor() {
        const blockTextures = Blocks.blocks.flatMap(
            (block) => block.blockModels.flatMap((blockModel) => getBlockModelTextures(blockModel)),
        );

        this.blockTextureSources = removeDuplicates(blockTextures);
        this.textureAtlas = new TextureAtlas(this.blockTextureSources);
    }

    public async init() {
        const atlas = await this.textureAtlas.buildAtlas();
        this.solidMaterial = makeOpaqueBlockMaterial(atlas);
        this.transparentMaterial = makeOpaqueBlockMaterial(atlas);
        this.waterMaterial.map = atlas;
    }

    public update(deltaTime: number) {
    }

    public static getBlockId(block: Block): number {
        return Blocks.blocks.indexOf(block);
    }

    public static getBlockById(id: number): Block {
        return Blocks.blocks[id];
    }

    public getBlockMaterials(): { solid: ShaderMaterial, transparent: Material, water: Material } {
        return {
            solid: this.solidMaterial!,
            transparent: this.transparentMaterial!,
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
