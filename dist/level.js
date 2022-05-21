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
import { DirectionalLight, Object3D, Vector2, Vector3 } from "three";
import { Player } from "./player/player";
import { Game } from "./game";
import { degToRad } from "three/src/math/MathUtils";
import { World } from "./world/world";
// TODO: The abstraction between level & world isn't really clear. Come up with a concept.
var Level = /** @class */ (function () {
    function Level(scene) {
        this.scene = scene;
        // Lighting
        this.sun = new DirectionalLight(0xffffff, 0.6);
        this.sun.position.set(0, 1, 0);
        this.sunTarget = new Object3D();
        this.sunTarget.position.set(0.2, 0, 0.4);
        this.sun.target = this.sunTarget;
        this.scene.add(this.sun, this.sunTarget);
        // Player
        this.player = new Player(Game.main.camera, Game.main.input, new Vector3(0, 40, 0), new Vector2(degToRad(0), degToRad(0)));
        this.world = new World(this.scene);
    }
    Level.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.player.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.world.init()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Level.prototype.update = function (deltaTime) {
        var oldPos = this.player.getChunkPosition();
        this.player.update(deltaTime);
        var newPos = this.player.getChunkPosition();
        if (oldPos[0] !== newPos[0] || oldPos[2] !== newPos[2]) {
            this.world.setPlayerChunk(newPos[0], newPos[2]);
        }
        this.world.update(deltaTime);
    };
    Level.prototype.lateUpdate = function (deltaTime) {
        this.world.lateUpdate(deltaTime);
    };
    Level.prototype.destroy = function () {
        if (this.sun)
            this.scene.remove(this.sun);
    };
    Level.prototype.onTick = function (deltaTime) {
        this.world.tick(deltaTime);
    };
    Level.prototype.setBlockAt = function (pos, block) {
        return this.world.setBlock({ x: pos.x, y: pos.y, z: pos.z }, block);
    };
    Level.prototype.getBlockAt = function (pos) {
        return this.world.getBlock({ x: pos.x, y: pos.y, z: pos.z });
    };
    Level.prototype.getChunkMeshes = function () {
        return this.world.__tempGetChunkMeshes();
    };
    return Level;
}());
export { Level };
