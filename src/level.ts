import { DirectionalLight, Mesh, Object3D, Scene, Vector2, Vector3 } from "three";
import { ITickable } from "./tickable";
import { Player } from "./player/player";
import { Game } from "./game";
import { degToRad } from "three/src/math/MathUtils";
import { World } from "./world/world";
import { Block } from "./block/block";

// TODO: The abstraction between level & world isn't really clear. Come up with a concept.
export class Level implements ITickable {
    private sun: DirectionalLight;
    private sunTarget: Object3D;

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
    }

    public update(deltaTime: number) {
        const oldPos = this.player.getChunkPosition();
        this.player.update(deltaTime);
        const newPos = this.player.getChunkPosition();
        if (oldPos[0] !== newPos[0] || oldPos[2] !== newPos[2]) {
            this.world.setPlayerChunk(newPos[0], newPos[2]);
        }

        this.world.update(deltaTime);
    }

    public lateUpdate(deltaTime: number) {
        this.world.lateUpdate(deltaTime);
    }
    
    public destroy() {
        if (this.sun) this.scene.remove(this.sun);
    }

    public onTick(deltaTime: number) {
        this.world.tick(deltaTime);
    }

    public setBlockAt(pos: Vector3, block: Block): void {
        return this.world.setBlock({ x: pos.x, y: pos.y, z: pos.z }, block);
    }

    public getBlockAt(pos: Vector3): Block | undefined {
        return this.world.getBlock({ x: pos.x, y: pos.y, z: pos.z });
    }

    public getChunkMeshes(): Mesh[] {
        return this.world.__tempGetChunkMeshes();
    }
}
