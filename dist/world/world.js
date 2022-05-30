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
import bezier from 'bezier-easing';
import { Color } from 'three';
import { modifyBlockPosValues } from '../block/block-pos';
import { Game } from '../game';
import { mod } from '../util/mod';
import { ChunkColumnManager } from './chunk-column-manager';
import { SkyBox } from './sky/sky-box';
var World = /** @class */ (function () {
    function World(level, scene) {
        this.level = level;
        this.scene = scene;
        this.dayTime = 0;
        this.dayPhaseEasing = bezier(0.6, 0, 0.4, 1);
        this.chunkColumnManager = new ChunkColumnManager(scene, 7, 3, 4);
        this.skyBox = new SkyBox(Game.main.camera);
        this.skyBox.register(scene);
    }
    World.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var playerPosition;
            return __generator(this, function (_a) {
                playerPosition = this.level.player.getChunkPosition();
                this.chunkColumnManager.setCenter(playerPosition[0], playerPosition[1]);
                return [2 /*return*/];
            });
        });
    };
    World.prototype.tick = function (deltaTime) {
        this.chunkColumnManager.tick(deltaTime);
    };
    World.prototype.update = function (deltaTime) {
        this.updateDayTime(deltaTime);
        this.chunkColumnManager.update(deltaTime);
    };
    World.prototype.lateUpdate = function (deltaTime) {
        this.chunkColumnManager.lateUpdate(deltaTime);
    };
    World.prototype.updateDayTime = function (deltaTime) {
        this.dayTime += (deltaTime / 1000);
        // 0 = 1 = midday; 0.5 = night;
        var dayPhase = mod(this.dayTime, 300) / 300;
        // 0.5 = midday;
        var bounce = Math.cos(dayPhase * Math.PI * 2) * 0.5 + 0.5;
        var ambientColorLerp = this.dayPhaseEasing(bounce);
        var solid = Game.main.blocks.getBlockMaterials().solid;
        solid.uniforms.fSkyLightFactor.value = ambientColorLerp;
        Game.main.scene.background = new Color('#0c0b17').lerp(new Color('#96d7e0'), ambientColorLerp);
        this.skyBox.update(dayPhase);
    };
    World.prototype.setPlayerChunk = function (x, z) {
        this.chunkColumnManager.setCenter(x, z);
    };
    World.prototype.setBlock = function (pos, block) {
        block.onSetBlock(this, pos);
        var normalizedPos = modifyBlockPosValues(pos, function (v) { return mod(v, 16); });
        var chunkColumnPos = modifyBlockPosValues(pos, function (v) { return Math.floor(v / 16); });
        // TODO: This is a hack to update the sky light of the chunk column. There must be a better way.
        var column = this.chunkColumnManager.getChunkColumn(chunkColumnPos.x, chunkColumnPos.z);
        if (!column) {
            return;
        }
        column.setBlockAt([normalizedPos.x, pos.y, normalizedPos.z], block);
    };
    World.prototype.getBlock = function (pos) {
        var chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            return undefined;
        }
        return chunk.getBlock([
            mod(pos.x, 16),
            mod(pos.y, 16),
            mod(pos.z, 16),
        ]);
    };
    World.prototype.getBlockState = function (pos) {
        var chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            return undefined;
        }
        return chunk.getBlockState([
            mod(pos.x, 16),
            mod(pos.y, 16),
            mod(pos.z, 16),
        ]);
    };
    World.prototype.setBlockState = function (pos, blockState) {
        var chunk = this.chunkColumnManager.getChunkByBlockPos(pos);
        if (!chunk) {
            return undefined;
        }
        chunk.setBlockState([mod(pos.x, 16), mod(pos.y, 16), mod(pos.z, 16)], blockState);
    };
    World.prototype.playSound = function (name) {
        this.level.getGame().audioManager.playSound(name);
    };
    World.prototype.__tempGetChunkMeshes = function () {
        return this.chunkColumnManager.__tempGetChunkMeshes();
    };
    return World;
}());
export { World };
