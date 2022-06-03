import bezier, { EasingFunction } from 'bezier-easing';
import { Color, Mesh, Scene, Vector3 } from 'three';
import { SoundNames } from '../audio/sounds';
import { Block } from '../block/block';
import { BlockPos, modifyBlockPosValues } from '../block/block-pos';
import { BlockState, BlockStateValues } from '../block/block-state/block-state';
import { Blocks } from '../block/blocks';
import { Game } from '../game';
import { Level } from '../level';
import { areBlockLightPropertiesEqual } from '../light/are-block-light-properties-equal';
import { BlockLightEngine } from '../light/block-light-engine';
import { LightEngine } from '../light/light-engine';
import { SkyLightEngine } from '../light/sky-light-engine';
import { mod } from '../util/mod';
import { ChunkColumnManager } from './chunk-column-manager';
import { SkyBox } from './sky/sky-box';

export class World {
    /* TODO: Make this private */ public readonly chunkColumnManager: ChunkColumnManager;
    public readonly blockLightEngine: BlockLightEngine;
    public readonly skyLightEngine: SkyLightEngine;

    private dayTime: number = 0;
    private skyBox: SkyBox;
    private dayPhaseEasing: EasingFunction = bezier(0.6, 0, 0.4, 1);

    public constructor(private readonly level: Level, readonly scene: Scene) {
        this.chunkColumnManager = new ChunkColumnManager(scene, 7, 3, 4);
        this.blockLightEngine = new BlockLightEngine(this.chunkColumnManager);
        this.skyLightEngine = new SkyLightEngine(this.chunkColumnManager);

        this.skyBox = new SkyBox(Game.main.camera);
        this.skyBox.register(scene);
    }

    public async init() {
        const playerPosition = this.level.player.getChunkPosition();
        this.chunkColumnManager.setCenter(playerPosition[0], playerPosition[1]);
    }

    public tick(deltaTime: number) {
        this.chunkColumnManager.tick(deltaTime);
    }

    public update(deltaTime: number) {
        this.updateDayTime(deltaTime);
        this.chunkColumnManager.update(deltaTime);

        this.skyLightEngine.run();
        this.blockLightEngine.run();
    }

    public lateUpdate(deltaTime: number) {
        this.chunkColumnManager.lateUpdate(deltaTime);
    }

    private updateDayTime(deltaTime: number) {
        this.dayTime += (deltaTime / 1000);
        // 0 = 1 = midday; 0.5 = night;
        const dayPhase = mod(this.dayTime, 300) / 300;

        // 0.5 = midday;
        const bounce = Math.cos(dayPhase * Math.PI * 2) * 0.5 + 0.5;
        const ambientColorLerp = this.dayPhaseEasing(bounce);
        const { solid } = Game.main.blocks.getBlockMaterials();
        solid.uniforms.fSkyLightFactor.value = ambientColorLerp;
        Game.main.scene.background = new Color('#0c0b17').lerp(new Color('#96d7e0'), ambientColorLerp);

        this.skyBox.update(dayPhase);
    }

    public setPlayerChunk(x: number, z: number) {
        this.chunkColumnManager.setCenter(x, z);
    }

    public setBlock(pos: BlockPos, block: Block) {
        if (block !== Blocks.AIR) {
            const lightLevel = block.getLightLevel();
            if (lightLevel >= 0) {
                this.blockLightEngine.addLight(pos, lightLevel);
            } else {
                this.blockLightEngine.removeLight(pos);
            }
        } else {
            // this.blockLightEngine.fillLight(pos);
            this.blockLightEngine.removeLight(pos);
        }

        const normalizedPos = modifyBlockPosValues(pos, (v) => mod(v, 16));
        const chunkColumnPos = modifyBlockPosValues(pos, (v) => Math.floor(v / 16));

        // TODO: This is a hack to update the sky light of the chunk column. There must be a better way.
        const column = this.chunkColumnManager.getChunkColumn(chunkColumnPos.x, chunkColumnPos.z);
        if (!column) {
            return;
        }
        const oldBlock = column.getBlockAt([normalizedPos.x, pos.y, normalizedPos.z]);
        if (!oldBlock) {
            return;
        }

        block.onSetBlock(this, pos);
        column.setBlockAt([normalizedPos.x, pos.y, normalizedPos.z], block);

        if (!areBlockLightPropertiesEqual(block, oldBlock)) {
            // this.skylightDirty = true;
            // Game.main.level.getWorld().skyLightEngine.floodChunk(this.chunks[0]);
            Game.main.level.getWorld().skyLightEngine.fillLight(pos);
        }
    }

    public getBlock(pos: BlockPos): Block | undefined {
        const chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            return undefined;
        }

        return chunk.getBlock([
            mod(pos.x, 16),
            mod(pos.y, 16),
            mod(pos.z, 16),
        ]);
    }

    public getBlockState<T extends BlockStateValues>(pos: BlockPos): BlockState<T> | undefined {
        const chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            return undefined;
        }

        return chunk.getBlockState([
            mod(pos.x, 16),
            mod(pos.y, 16),
            mod(pos.z, 16),
        ]) as BlockState<T>;
    }

    public setBlockState(pos: BlockPos, blockState: BlockState) {
        const chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            return undefined;
        }

        chunk.setBlockState([mod(pos.x, 16), mod(pos.y, 16), mod(pos.z, 16)], blockState);
    }

    public playSound(name: SoundNames[number]): void {
        this.level.getGame().audioManager.playSound(name);
    }

    public playSound3D(name: SoundNames[number], pos: Vector3): void {
        this.level.getGame().audioManager.playSound3D(name, pos);
    }

    public __tempGetChunkMeshes(): Mesh[] {
        return this.chunkColumnManager.__tempGetChunkMeshes();
    }
}
