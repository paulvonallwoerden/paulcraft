import { DirectionalLight, Euler, Light, Mesh, Object3D, Scene, Vector2, Vector3 } from "three";
import { ITickable } from "./tickable";
import SimplexNoise from 'simplex-noise';
import { ChunkColumn } from "./world/chunk-column";
import { indexToXZ, xzTupelToIndex } from "./util/index-to-vector2";
import { Player } from "./player/player";
import { Game } from "./game";
import { degToRad } from "three/src/math/MathUtils";

export class Level implements ITickable {
    private sun: DirectionalLight;
    private sunTarget: Object3D;
    private simplexNoise: SimplexNoise;

    private chunkColumns: ChunkColumn[] = [];
    private player: Player;

    public constructor(private readonly scene: Scene) {
        // Lighting
        this.sun = new DirectionalLight(0xffffff, 0.6);
        this.sun.position.set(0, 1, 0);
        this.sunTarget = new Object3D();
        this.sunTarget.position.set(0.2, 0, 0.4);
        this.sun.target = this.sunTarget;
        this.scene.add(this.sun, this.sunTarget);

        // World gen
        this.simplexNoise = new SimplexNoise();        
        for (let i = 0; i < 32 * 32; i++) {
            const chunkColumn = new ChunkColumn(
                this.scene,
                indexToXZ(i, 32),
                5,
                this.simplexNoise,
            );
            chunkColumn.load();

            this.chunkColumns.push(chunkColumn);
        }

        // Player
        this.player = new Player(
            Game.main.camera,
            Game.main.input,
            new Vector3(16.5, 24, 16.5),
            new Vector2(0, degToRad(180)),
        );
    }

    public async init() {
        await this.player.init();
    }

    public update(deltaTime: number) {
        this.player.update(deltaTime);
    }
    
    public destroy() {
        if (this.sun) this.scene.remove(this.sun);
    }

    public onTick(deltaTime: number) {
        this.chunkColumns.forEach((chunkColumn) => chunkColumn.onTick(deltaTime));
    }

    public setBlockAt(pos: Vector3, blockId: number): void {
        const columnIndex = xzTupelToIndex(Math.floor(pos.x / 16), Math.floor(pos.z / 16), 32);

        return this.chunkColumns[columnIndex].setBlockAt(
            [
                pos.x % 16,
                pos.y,
                pos.z % 16,
            ],
            blockId,
        );
    }

    public getBlockAt(pos: Vector3): number | undefined {
        const columnIndex = xzTupelToIndex(Math.floor(pos.x / 16), Math.floor(pos.z / 16), 32);
        if (!this.chunkColumns[columnIndex]) {
            return undefined;
        }

        return this.chunkColumns[columnIndex].getBlockAt([
            pos.x % 16,
            pos.y,
            pos.z % 16,
        ]);
    }

    public getChunkMeshes(): Mesh[] {
        return this.chunkColumns.flatMap((chunkColumn) => chunkColumn.getChunkMeshes());
    }
}
