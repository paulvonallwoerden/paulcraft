var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { AmbientLight, Audio, AudioListener, AudioLoader, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { Blocks } from './block/blocks';
import { Input } from './input/input';
import { Level } from './level';
import { OriginCross } from './origin-cross';
import { ChunkGeneratorPool } from './world/chunk/chunk-generator-pool';
import { ChunkGeometryBuilderPool } from './world/chunk/chunk-geometry-builder-pool';
import Stats from 'stats.js';
import { AudioManager } from './audio/audio-manager';
import { ListOfSounds } from './audio/sounds';
// TODO: This class has too many responsibilities. Factor it out.
var Game = /** @class */ (function () {
    function Game(root) {
        this.root = root;
        this.looping = false;
        this.lastAnimationFrameAt = 0;
        this.timeSinceLastTick = 0;
        this.ticksPerSecond = 20;
        this.blocks = new Blocks();
        // TODO: Make this configurable or at least random.
        this.seed = 'ijn3fi3fin3fim';
        this.audioListener = new AudioListener();
        this.audioManager = new AudioManager(this.audioListener, new AudioLoader(), ListOfSounds);
        this.musicAudio = new Audio(this.audioListener);
        this.chunkGeneratorPool = new ChunkGeneratorPool();
        this.chunkGeometryBuilderPool = new ChunkGeometryBuilderPool(this.blocks.serializeBlockModels());
        this.stats = new Stats();
        Game.main = this;
        this.scene = new Scene();
        // this.scene.fog = new Fog(0xe6fcff, 90, 110)
        var width = root.clientWidth, height = root.clientHeight;
        var ambientLight = new AmbientLight(0x888888);
        this.scene.add(ambientLight);
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0xe6fcff);
        var canvas = root.appendChild(this.renderer.domElement);
        canvas.addEventListener('click', function () { return canvas.requestPointerLock(); });
        this.camera = new PerspectiveCamera(75, width / height, 0.1, 100000);
        this.camera.add(this.audioListener);
        this.input = new Input(document.body);
        var originCross = new OriginCross();
        originCross.addToScene(this.scene);
        this.stats.showPanel(0);
        root.appendChild(this.stats.dom);
        // Observe a scene or a renderer
        if (typeof window.__THREE_DEVTOOLS__ !== 'undefined') {
            window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this.scene }));
            window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this.renderer }));
        }
        this.onAnimationFrame = this.onAnimationFrame.bind(this);
    }
    Game.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var musicLoader, shimmer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Crafting the blocks...");
                        this.blocks = new Blocks();
                        return [4 /*yield*/, this.blocks.init()];
                    case 1:
                        _a.sent();
                        // Workers
                        console.log("Waking up the workers...");
                        return [4 /*yield*/, this.chunkGeometryBuilderPool.addWorkers(4)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.chunkGeneratorPool.addWorkers(1)];
                    case 3:
                        _a.sent();
                        // Legacy
                        // for (let i = 0; i < 4; i++) {
                        //     const worker = new ChunkDataGeneratorWorker();
                        //     worker.postMessage({
                        //         type: 'seed',
                        //         seed: this.seed,
                        //     });
                        //     worker.addEventListener('message', ({ data }) => {
                        //         if (data.type === 'generate--complete') {
                        //             this.chunkDataGenerationResults[JSON.stringify(data.position)] = data.result;
                        //         }
                        //         if (data.type === 'build-mesh--complete') {
                        //             this.chunkGeometryResults[JSON.stringify(data.position)] = data.result;
                        //         }
                        //     });
                        //     this.chunkDataGeneratorWorkerPool.push(worker);
                        // }
                        // Level
                        console.log("Leveling...");
                        this.level = new Level(this, this.scene);
                        return [4 /*yield*/, this.level.init()];
                    case 4:
                        _a.sent();
                        // Audio
                        console.log("Making it sound nice...");
                        return [4 /*yield*/, this.audioManager.load()];
                    case 5:
                        _a.sent();
                        musicLoader = new AudioLoader();
                        return [4 /*yield*/, musicLoader.loadAsync('audio/music/shimmer.mp3')];
                    case 6:
                        shimmer = _a.sent();
                        this.musicAudio.setLoop(true);
                        this.musicAudio.setBuffer(shimmer);
                        this.musicAudio.setVolume(0.2);
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.startLoop = function () {
        this.looping = true;
        this.timeSinceLastTick = 0;
        window.requestAnimationFrame(this.onAnimationFrame);
    };
    Game.prototype.onAnimationFrame = function (time) {
        if (!this.looping) {
            return;
        }
        this.stats.begin();
        if (this.lastAnimationFrameAt === 0) {
            this.lastAnimationFrameAt = time;
        }
        var deltaTime = time - this.lastAnimationFrameAt;
        this.lastAnimationFrameAt = time;
        this.loop(deltaTime);
        this.stats.end();
        window.requestAnimationFrame(this.onAnimationFrame);
    };
    Game.prototype.loop = function (deltaTime) {
        this.timeSinceLastTick += deltaTime;
        if (this.timeSinceLastTick >= 1000 / this.ticksPerSecond) {
            this.tick(deltaTime);
            this.timeSinceLastTick -= 1000 / this.ticksPerSecond;
        }
        this.blocks.update(deltaTime);
        this.level.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
        this.level.lateUpdate(deltaTime);
        this.input.lateUpdate();
    };
    Game.prototype.tick = function (deltaTime) {
        this.level.onTick(deltaTime);
    };
    return Game;
}());
export { Game };
