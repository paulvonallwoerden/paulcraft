import { DirectionalLight, Euler, Light, Mesh, Object3D, Scene, Vector2, Vector3 } from "three";
import { ITickable } from "./tickable";
import SimplexNoise from 'simplex-noise';
import { ChunkColumn } from "./world/chunk-column";
import { indexToXZ, xzTupelToIndex } from "./util/index-to-vector2";
import { Player } from "./player/player";
import { Game } from "./game";
import { degToRad } from "three/src/math/MathUtils";
import { AIR_BLOCK_ID, SAND_BLOCK_ID, OAK_LOG_BLOCK_ID, STONE_BLOCK_ID, GRASS_BLOCK_ID, MYCELIUM_BLOCK_ID, SNOW_BLOCK_ID, WATER_BLOCK_ID } from "./block/block-ids";
import { Biome } from "./world/biome/biome";
import { WorldNoise } from "./world/world-noise";
import { CHUNK_WIDTH } from "./world/chunk/chunk-constants";
import { World } from "./world/world";

export class Level implements ITickable {
    private sun: DirectionalLight;
    private sunTarget: Object3D;
    // private simplexNoise: SimplexNoise;

    private chunkColumns: ChunkColumn[] = [];
    private readonly player: Player;
    private readonly world: World;

    public constructor(private readonly scene: Scene) {
        // Lighting
        this.sun = new DirectionalLight(0xffffff, 0.6);
        this.sun.position.set(0, 1, 0);
        this.sunTarget = new Object3D();
        this.sunTarget.position.set(0.2, 0, 0.4);
        this.sun.target = this.sunTarget;
        this.scene.add(this.sun, this.sunTarget);

        // World gen
        // this.simplexNoise = new SimplexNoise();        
        // for (let i = 0; i < 32 * 32; i++) {
        //     const chunkColumn = new ChunkColumn(
        //         this.scene,
        //         indexToXZ(i, 32),
        //         5,
        //         this.simplexNoise,
        //     );
        //     chunkColumn.load();

        //     this.chunkColumns.push(chunkColumn);
        // }

        // Player
        this.player = new Player(
            Game.main.camera,
            Game.main.input,
            new Vector3(0, 40, 0),
            new Vector2(degToRad(0), degToRad(0)),
        );
        this.world = new World(this.scene);
    }

    public async init() {
        await this.player.init();
        await this.world.init();

        const blockByBiome = (b: Biome) => {
            switch(b) {
                case Biome.Desert:
                    return SAND_BLOCK_ID;
                case Biome.OakForest:
                    return OAK_LOG_BLOCK_ID;
                case Biome.Plains:
                    return GRASS_BLOCK_ID;
                case Biome.Hills:
                    return STONE_BLOCK_ID;
                case Biome.Tundra:
                    return MYCELIUM_BLOCK_ID;
                case Biome.Snow:
                    return SNOW_BLOCK_ID;
                default:
                    return AIR_BLOCK_ID;
            }
        }

        // const simplexNoise = new SimplexNoise();
        // const worldNoise = new WorldNoise(9);
        // for (let i = 0; i < 32 * 32; i++) {
        //     const chunkPos = indexToXZ(i, 32);
        //     const chunkColumn = new ChunkColumn(
        //         this.scene,
        //         chunkPos,
        //         8,
        //         simplexNoise,
        //     );
        //     this.chunkColumns.push(chunkColumn);
            
        //     // const biomeMap = await Game.main.chunkGeneratorPool.generateBiomeMap(chunkPos);
        //     // const heightMap = await Game.main.chunkGeneratorPool.generateHeightMap(chunkPos, biomeMap);

        //     for (let j = 0; j < CHUNK_WIDTH * CHUNK_WIDTH; j++) {
        //         const pos = indexToXZ(j, CHUNK_WIDTH);
        //         // const biome = biomeMap.getV(pos);
        //         const continentalness = worldNoise.sampleContinentalness(pos.x + chunkPos.x * CHUNK_WIDTH, pos.y + chunkPos.y * CHUNK_WIDTH);
        //         const erosion = worldNoise.sampleErosion(pos.x + chunkPos.x * CHUNK_WIDTH, pos.y + chunkPos.y * CHUNK_WIDTH);
        //         const height = erosion + continentalness;
        //         const ocean = continentalness < 64;
        //         this.chunkColumns[i].setBlockAt(
        //             [
        //                 pos.x,
        //                 // heightMap.getV(pos),
        //                 ocean ? 63 : height,
        //                 pos.y,
        //             ],
        //             ocean ? WATER_BLOCK_ID : GRASS_BLOCK_ID,
        //             true,
        //         );
        //     }

        //     for (const iterator of this.chunkColumns[i].chunks) {
        //         iterator.buildMesh();
        //     }
        // }
    }

    public update(deltaTime: number) {
        const oldPos = this.player.getChunkPosition();
        this.player.update(deltaTime);
        const newPos = this.player.getChunkPosition();
        if (oldPos[0] !== newPos[0] || oldPos[2] !== newPos[2]) {
            this.world.setPlayerChunk(newPos[0], newPos[2]);
        }
    }

    public lateUpdate(deltaTime: number) {
        this.world.lateUpdate(deltaTime);
    }
    
    public destroy() {
        if (this.sun) this.scene.remove(this.sun);
    }

    public onTick(deltaTime: number) {
        // this.chunkColumns.forEach((chunkColumn) => chunkColumn.onTick(deltaTime));
        this.world.tick(deltaTime);
    }

    public setBlockAt(pos: Vector3, blockId: number): void {
        // const columnIndex = xzTupelToIndex(Math.floor(pos.x / 16), Math.floor(pos.z / 16), 32);

        // return this.chunkColumns[columnIndex].setBlockAt(
        //     [
        //         pos.x % 16,
        //         pos.y,
        //         pos.z % 16,
        //     ],
        //     blockId,
        // );
        const block = Game.main.blocks.getBlockById(blockId);

        return this.world.setBlock({ x: pos.x, y: pos.y, z: pos.z }, block);
    }

    public getBlockAt(pos: Vector3): number | undefined {
        return this.world.getBlock({ x: pos.x, y: pos.y, z: pos.z });
    }

    public getChunkMeshes(): Mesh[] {
        return this.world.__tempGetChunkMeshes();
        //return this.chunkColumns.flatMap((chunkColumn) => chunkColumn.getChunkMeshes());
    }
}
