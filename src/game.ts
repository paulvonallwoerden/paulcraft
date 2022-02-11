import { AmbientLight, Audio, AudioListener, AudioLoader, Camera, Fog, FogExp2, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { Blocks, DirtBlock, GrassBlock, OakLeavesBlock, OakLogBlock, SandBlock, StoneBlock, WaterBlock } from './block/blocks';
import { Input } from './input/input';
import { Level } from './level';
import { OriginCross } from './origin-cross';
import { SpectatorCamera } from './spectator-camera';
import ChunkDataGeneratorWorker from './world/chunk-data-generator.worker.ts';
import { ChunkMeshData } from './world/chunk-renderer';

export class Game {
    public static main: Game;

    private looping = false;
    private lastAnimationFrameAt: DOMHighResTimeStamp = 0;

    private timeSinceLastTick: number = 0;
    private ticksPerSecond = 20;

    public readonly scene: Scene;
    public readonly renderer: WebGLRenderer;
    public readonly camera: Camera;

    public blocks!: Blocks;
    public level!: Level;

    private chunkDataGeneratorWorker!: ChunkDataGeneratorWorker;
    private chunkDataGeneratorWorkerPool: ChunkDataGeneratorWorker[] = [];

    private chunkDataGenerationResults: Record<string, Uint8Array> = {};
    private chunkGeometryResults: Record<string, ChunkMeshData> = {};

    public readonly input: Input;

    private readonly seed = Date.now();

    public readonly audioListener: AudioListener = new AudioListener();
    private readonly musicAudio: Audio = new Audio(this.audioListener);

    public constructor(readonly root: HTMLElement) {
        Game.main = this;

        this.scene = new Scene();
        this.scene.fog = new Fog(0xe6fcff, 15 * 16, 15.5 * 16)
        const { clientWidth: width, clientHeight: height } = root;

        const ambientLight = new AmbientLight(0x888888);
        this.scene.add(ambientLight);

        this.renderer = new WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0xe6fcff)
        const canvas = root.appendChild(this.renderer.domElement);
        canvas.addEventListener('click', () => canvas.requestPointerLock());

        // this.camera = new SpectatorCamera(width / height);
        this.camera = new PerspectiveCamera(75, width / height, 0.1, 100000);
        this.camera.add(this.audioListener);

        this.input = new Input(document.body);

        const originCross = new OriginCross();
        originCross.addToScene(this.scene);

        this.onAnimationFrame = this.onAnimationFrame.bind(this);
    }

    public async init() {
        this.blocks = new Blocks([StoneBlock, GrassBlock, DirtBlock, WaterBlock, SandBlock, OakLogBlock, OakLeavesBlock]);
        await this.blocks.init();

        for (let i = 0; i < 4; i++) {
            const worker = new ChunkDataGeneratorWorker();
            worker.postMessage({
                type: 'seed',
                seed: this.seed,
            });

            worker.addEventListener('message', ({ data }) => {
                if (data.type === 'generate--complete') {
                    this.chunkDataGenerationResults[JSON.stringify(data.position)] = data.result;
                }

                if (data.type === 'build-mesh--complete') {
                    this.chunkGeometryResults[JSON.stringify(data.position)] = data.result;
                }
            });

            this.chunkDataGeneratorWorkerPool.push(worker);
        }

        
        this.level = new Level(this.scene);
        await this.level.init();


        const musicLoader = new AudioLoader();
        const shimmer = await musicLoader.loadAsync('audio/music/shimmer.mp3')

        this.musicAudio.setLoop(true);
        this.musicAudio.setBuffer(shimmer);
        this.musicAudio.setVolume(0.2);
        this.musicAudio.play();
    }

    public generateChunkData(position: Vector3): void {
        this.instructWorker({
            type: 'generate',
            position: position.toArray(),
        });
    }

    public buildChunkGeometry(position: Vector3, blockData: Uint8Array): void {
        this.instructWorker({
            type: 'build-mesh',
            position: position.toArray(),
            blockTextureUvs: this.blocks.serializeBlockUvs(),
            blockData,
        });
    }

    private instructWorker(message: unknown) {
        const worker = this.chunkDataGeneratorWorkerPool.pop();
        if (!worker) {
            throw new Error('No worker to work :-(');
        }

        worker.postMessage(message);
        this.chunkDataGeneratorWorkerPool.unshift(worker);
    }

    public getMaybeChunkData(position: Vector3): Uint8Array | undefined {
        const key = JSON.stringify(position.toArray());
        if (this.chunkDataGenerationResults[key] === undefined) {
            return undefined;
        }

        return this.chunkDataGenerationResults[key];
    }

    public getMaybeChunkGeometry(position: Vector3): ChunkMeshData | undefined {
        const key = JSON.stringify(position.toArray());
        if (this.chunkGeometryResults[key] === undefined) {
            return undefined;
        }

        return this.chunkGeometryResults[key];
    }

    public startLoop() {
        this.looping = true;

        this.timeSinceLastTick = 0;
        window.requestAnimationFrame(this.onAnimationFrame)
    }

    private onAnimationFrame(time: DOMHighResTimeStamp) {
        if (!this.looping) {
            return;
        }

        if (this.lastAnimationFrameAt === 0) {
            this.lastAnimationFrameAt = time;
        }
        const deltaTime = time - this.lastAnimationFrameAt;
        this.lastAnimationFrameAt = time;
        this.loop(deltaTime);

        window.requestAnimationFrame(this.onAnimationFrame);
    }

    private loop(deltaTime: number) {
        this.timeSinceLastTick += deltaTime;
        if (this.timeSinceLastTick >= 1000 / this.ticksPerSecond) {
            this.tick(deltaTime);
            this.timeSinceLastTick -= 1000 / this.ticksPerSecond;
        }

        // this.camera.update(deltaTime);

        this.level.update(deltaTime);
        this.renderer.render(this.scene, this.camera);

        this.input.lateUpdate();
    }

    private tick(deltaTime: number) {
        this.level.onTick(deltaTime);
    }
}
