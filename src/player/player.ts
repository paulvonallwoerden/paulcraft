import pMap from 'p-map';
import { Audio, AudioLoader, Box3, Camera, Intersection, MathUtils, Raycaster, Vector2, Vector3, Vector3Tuple } from 'three';
import { degToRad, radToDeg } from 'three/src/math/MathUtils';
import { Game } from '../game';
import { Input, LeftMouseButton, RightMouseButton } from '../input/input';
import { xyzTupelToIndex } from '../util/index-to-vector3';
import { randomElement } from '../util/random-element';
import { Blocks } from '../block/blocks';
import { BlockPos, floorBlockPos, modifyBlockPosValues } from '../block/block-pos';
import { WorldCursor } from './world-cursor';
import { mod } from '../util/mod';
import { Hud } from '../ui/hud/hud';
import { Block } from '../block/block';
import { BlockFace, blockFaceByNormal } from '../block/block-face';
import { Inventory } from '../inventory/inventory';
import { UseAction } from '../item/item';
import { Items } from '../item/items';
import { InventoryUi } from '../inventory/inventory-ui';

// TODO: Re-factor to:
// - don't use createTerrainCollisionBoxes as it's stupid.
// - use block-based ray-casting and not mesh-based ray-casting.
// - not be responsible for playing audio.
// - have separated input & physics logic.
// TODO: Support blocks that shouldn't have collision. E.g. flowers.
export class Player {
    private readonly walkingSpeed = 0.025;
    private readonly flyingSpeed = 0.065;

    private isOnGround = false;
    private velocity = new Vector3();

    private flying = false;
    private noclip = false;

    private start = false;

    private readonly raycaster: Raycaster = new Raycaster();
    private readonly collisionBox = new Box3(new Vector3(-0.35, 0, -0.35), new Vector3(0.35, 1.8, 0.35));
    private readonly terrainCollisionBoxes: Box3[] = [];

    private placeBlockSounds: AudioBuffer[] = [];
    private digBlockSounds: AudioBuffer[] = [];
    private readonly audio: Audio;

    public readonly inventory = new Inventory(30);
    public selectedInventorySlot = 0;
    public readonly inventoryUi = new InventoryUi(this.inventory);

    private readonly worldCursor: WorldCursor;

    public constructor(
        private readonly camera: Camera,
        private readonly input: Input,
        public position: Vector3,
        private rotation: Vector2,
    ) {
        this.worldCursor = new WorldCursor(Game.main.blocks);

        this.audio = new Audio(Game.main.audioListener);

        this.updateMovement(0, 0);
        this.updateCamera(0);

        this.inventory.put(Items.BOMB);
        this.inventory.put(Items.getBlockItem(Blocks.STONE), 64);
        this.inventory.put(Items.getBlockItem(Blocks.DIRT), 64);
        this.inventory.put(Items.getBlockItem(Blocks.SAND), 64);
        this.inventory.put(Items.getBlockItem(Blocks.TORCH), 64);
        this.inventory.put(Items.getBlockItem(Blocks.CAULDRON), 64);
        this.inventory.put(Items.getBlockItem(Blocks.DOOR), 64);
        this.inventory.put(Items.getBlockItem(Blocks.WATER), 64);
        this.inventory.put(Items.getBlockItem(Blocks.SUGAR_CANE), 64);
    }

    public getChunkPosition(): [number, number, number] {
        return [
            Math.floor(this.position.x / 16),
            Math.floor(this.position.y / 16),
            Math.floor(this.position.z / 16),
        ];
    }

    public async init() {
        const audioLoader = new AudioLoader();
        this.digBlockSounds = await pMap(
            [
                'audio/dig0.mp3',
                'audio/dig1.mp3',
                'audio/dig2.mp3',
            ],
            async (src) => audioLoader.loadAsync(src),
        );
        this.placeBlockSounds = await pMap(
            [
                'audio/place0.mp3',
            ],
            async (src) => audioLoader.loadAsync(src),
        );
        this.audio.setVolume(0.2);

        this.worldCursor.register(Game.main.scene);

        const hud = new Hud(this);
        Game.main.uiManager.show(hud);
        Game.main.uiManager.show(this.inventoryUi);
    }

    public update(deltaTime: number) {
        // const intersections = this.raycaster.intersectObjects(Game.main.level.getChunkMeshes());
        // const intersection = intersections.reduce<Intersection | undefined>(
        //     (nearestIntersection, intersection) => nearestIntersection && nearestIntersection.distance < intersection.distance ? nearestIntersection : intersection,
        //     undefined,
        // );
        // if (intersection !== undefined && intersection.face) {
        //     const normalOffset = intersection.face.normal.normalize().multiplyScalar(0.1);
        //     const hitBlockPos: BlockPos = {
        //         x: Math.floor(intersection.point.x - normalOffset.x),
        //         y: Math.floor(intersection.point.y - normalOffset.y),
        //         z: Math.floor(intersection.point.z - normalOffset.z),
        //     };

        //     if (this.input.isKeyDowned(LeftMouseButton)) {
        //         if (this.audio.isPlaying) this.audio.stop();
        //         this.audio.setBuffer(randomElement(this.digBlockSounds));
        //         this.audio.play();

        //         const world = Game.main.level.getWorld();
        //         const blockToBreak = world.getBlock(hitBlockPos)!;
        //         world.setBlock(hitBlockPos, Blocks.AIR);
        //         blockToBreak?.onBreak(world, hitBlockPos);
        //     }

        //     { 
        //         const world = Game.main.level.getWorld();
        //         // this.worldCursor.set(world, hitBlockPos);

        //         if (this.input.isKeyDowned(RightMouseButton)) {
        //             const hitBlock = world.getBlock(hitBlockPos);
        //             const interactionResult = hitBlock?.onInteract(world, hitBlockPos);

        //             const samplePoint = intersection.point.clone().add(normalOffset);
        //             const [hitX, hitY, hitZ] = [
        //                 Math.floor(samplePoint.x),
        //                 Math.floor(samplePoint.y),
        //                 Math.floor(samplePoint.z),
        //             ];
        //             const blockPos = new Vector3(hitX, hitY, hitZ);

        //             if (interactionResult === false && ([Blocks.AIR, Blocks.WATER] as any).includes(world.getBlock(blockPos))) {
        //                 if (this.audio.isPlaying) this.audio.stop();
        //                 this.audio.setBuffer(randomElement(this.placeBlockSounds));
        //                 this.audio.play();
                        
        //                 // const blockToPlace = Blocks.getBlockById(this.selectedBlockId);
        //                 // Game.main.level.setBlockAt(blockPos, blockToPlace);
        //                 // blockToPlace.onPlace(this, world, blockPos);
        //             }
        //         }
        //     }
        // }

        if (this.input.isKeyDowned(LeftMouseButton)) {
            const itemStack = this.inventory.getSlot(this.selectedInventorySlot);
            if (!itemStack) {
                return;
            }
            const { item } = itemStack;
            const canUse = item.onUse(UseAction.Primary, Game.main.level.getWorld(), this);
            if (!canUse) {
                return;
            }

            this.inventory.tidy();
        }

        if (this.input.isKeyDowned(RightMouseButton)) {
            const facing = this.getFacingBlock();
            if (!facing) {
                return;
            }
            const { block } = facing;
            const canInteract = block.onInteract(Game.main.level.getWorld(), facing.pos);
            if (canInteract) {
                return;
            }

            const itemStack = this.inventory.getSlot(this.selectedInventorySlot);
            if (!itemStack) {
                return;
            }
            const { item } = itemStack;
            const canUse = item.onUse(UseAction.Secondary, Game.main.level.getWorld(), this);
            if (!canUse) {
                return;
            }

            this.inventory.tidy();
        }

        // TODO: Remove this temporary fix. It solves the problem of the player falling before the world terrain
        // is generated.
        if (this.input.isKeyPressed(' ')) {
            this.start = true;
        }
        if (!this.start) return;

        if (this.input.isKeyDowned('Q')) {
            this.selectedInventorySlot--;

            if (this.selectedInventorySlot < 0) this.selectedInventorySlot = 0;
            if (this.selectedInventorySlot >= this.inventory.countUsedSlots()) this.selectedInventorySlot = this.inventory.countUsedSlots() - 1;
            this.inventoryUi.setSelectedSlot(this.selectedInventorySlot);    
        }
        if (this.input.isKeyDowned('E')) {
            this.selectedInventorySlot++;

            if (this.selectedInventorySlot < 0) this.selectedInventorySlot = 0;
            if (this.selectedInventorySlot >= this.inventory.countUsedSlots()) this.selectedInventorySlot = this.inventory.countUsedSlots() - 1;
            this.inventoryUi.setSelectedSlot(this.selectedInventorySlot);    
        }

        // Movement
        const movementSpeed = this.flying ? this.flyingSpeed : this.walkingSpeed;
        {
            // Cheating
            if (this.input.isKeyDowned('F')) {
                this.flying = !this.flying;
            }

            if (this.input.isKeyDowned('N')) {
                this.noclip = !this.noclip;
            }

            if (this.input.isKeyDowned('P')) {
                console.log(`The current player position is ${this.position.toArray()}`);
            }

            if (this.input.isKeyDowned('Z')) {
                Game.main.level.getWorld().chunkColumnManager.drop();
                const chunkPosition = floorBlockPos(modifyBlockPosValues(this.position, (v) => v / 16));
                Game.main.level.getWorld().chunkColumnManager.setCenter(chunkPosition.x, chunkPosition.z);
            }

            if (this.input.isKeyDowned('M')) {
                this.inventory.put(Items.BOMB);
                Blocks.listBlocks().forEach((block) => this.inventory.put(Items.getBlockItem(block), 64));
            }

            if (this.input.isKeyDowned('L')) {
                const curBlockPos = floorBlockPos(this.position);
                // Game.main.level.getWorld().lightEngine.addLight(curBlockPos, 15);
            }

            if (this.input.isKeyDowned('K')) {
                const curBlockPos = floorBlockPos(this.position);
                // Game.main.level.getWorld().lightEngine.removeLight(curBlockPos);
            }

            const x = Math.cos(this.rotation.y);
            const z = Math.sin(this.rotation.y);
            const forward = new Vector2(x, z).normalize();
            const right = new Vector2(-z, x).normalize();

            this.velocity.multiply(new Vector3(0.9, 1, 0.9));
            const inputVector = this.getInputVector();
            this.velocity.add(new Vector3(
                (forward.y * inputVector.x + right.y * inputVector.z) * movementSpeed,
                inputVector.y,
                (forward.x * inputVector.x + right.x * inputVector.z) * movementSpeed,
            ));

            if (!this.flying) {
                this.velocity.setY(this.velocity.y - 0.00005 * deltaTime);
            } else {
                this.velocity.multiply(new Vector3(1, 0.9, 1));
            }
        }

        if (!this.noclip) {
            this.updateCollision(deltaTime, movementSpeed);
        }

        this.updateMovement(deltaTime, movementSpeed);
        this.updateCamera(deltaTime);
    }

    private getInputVector() {
        let inputVector = new Vector3();
        if (this.input.isKeyPressed('W')) {
            inputVector.setX(-1);
        }

        if (this.input.isKeyPressed('S')) {
            inputVector.setX(1);
        }

        if (this.input.isKeyPressed('D')) {
            inputVector.setZ(1);
        }

        if (this.input.isKeyPressed('A')) {
            inputVector.setZ(-1);
        }

        if (inputVector.length() > 1) {
            inputVector = inputVector.normalize();
        }

        if (this.input.isKeyPressed(' ') && (this.isOnGround || this.flying)) {
            inputVector.setY(0.012);
        }

        if (this.input.isKeyPressed('Shift') && this.flying) {
            inputVector.setY(-0.015);
        }

        return inputVector;
    }

    private updateCollision(deltaTime: number, movementSpeed: number) {
        const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime).multiply(new Vector3(movementSpeed, 1, movementSpeed));
        const potential = this.position.clone().add(deltaPosition);
        const collisionX = this.createTerrainCollisionBoxes([potential.x, this.position.y, this.position.z]);
        if (collisionX) {
            this.velocity.setX(0);
        }

        const collisionZ = this.createTerrainCollisionBoxes([this.position.x, this.position.y, potential.z]);
        if (collisionZ) {
            this.velocity.setZ(0);
        }

        const collisionY = this.createTerrainCollisionBoxes([this.position.x, potential.y, this.position.z]);
        if (!collisionY) {
            this.isOnGround = false;

            return;
        }

        this.isOnGround = this.velocity.y < 0;
        this.velocity.setY(0);
    }

    private createTerrainCollisionBoxes([x, y, z]: Vector3Tuple): boolean {
        this.collisionBox.set(new Vector3(x - 0.35, y, z - 0.35), new Vector3(x + 0.35, y + 1.8, z + 0.35));

        const world = Game.main.level.getWorld();

        const [blockX, blockY, blockZ] = [Math.floor(x + 0.5), Math.floor(y + 0.5), Math.floor(z + 0.5)];
        for (let ix = -2; ix < 2; ix += 1) {
            for (let iy = -2; iy < 3; iy += 1) {
                for (let iz = -2; iz < 2; iz += 1) {
                    const boxIndex = xyzTupelToIndex(ix + 2, iy + 2, iz + 2, 5, 5)
                    if (!this.terrainCollisionBoxes[boxIndex]) {
                        this.terrainCollisionBoxes[boxIndex] = new Box3();
                    }

                    const blockPos = new Vector3(blockX + ix, blockY + iy, blockZ + iz);
                    const block = Game.main.level.getBlockAt(blockPos);
                    const solidBlock = block !== undefined && block.isCollidable(world, blockPos);
                    this.terrainCollisionBoxes[boxIndex].set(
                        new Vector3(blockX + ix, blockY + iy, blockZ + iz),
                        new Vector3(blockX + ix + 1, blockY + iy + 1, blockZ + iz + 1),
                    );

                    if (!solidBlock) {
                        continue;
                    }

                    const collision = this.terrainCollisionBoxes[boxIndex].intersectsBox(this.collisionBox);
                    if (collision) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private updateMovement(deltaTime: number, movementSpeed: number): void {
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime).multiply(new Vector3(movementSpeed, 1, movementSpeed)));
    }

    private updateCamera(deltaTime: number) {
        this.camera.position.set(this.position.x, this.position.y + 1.8, this.position.z);
        this.rotation.x = MathUtils.clamp(
            this.rotation.x + degToRad(deltaTime * this.input.getMouseDelta()[1] * -0.01),
            -0.4999 * Math.PI,
            0.4999 * Math.PI,
        );
        this.rotation.y += degToRad(deltaTime * this.input.getMouseDelta()[0] * -0.01);
        const phi = this.rotation.x - 0.5 * Math.PI;
        const theta = this.rotation.y;
        const target = new Vector3().setFromSphericalCoords(1, phi, theta).add(this.camera.position);
        this.camera.lookAt(target)
    }

    public getFacingDirection(): number {
        return mod(Math.round(radToDeg(this.rotation.y) / 90), 4);
    }

    public getFacingBlock(): { pos: BlockPos, block: Block, face: BlockFace, point: Vector3 } | undefined {
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const intersections = this.raycaster.intersectObjects(Game.main.level.getChunkMeshes());
        const intersection = intersections.reduce<Intersection | undefined>(
            (nearestIntersection, intersection) => nearestIntersection && nearestIntersection.distance < intersection.distance ? nearestIntersection : intersection,
            undefined,
        );
        if (!intersection || !intersection.face) {
            return;
        }

        const { point, face: hitFace } = intersection;
        const normal = hitFace.normal.normalize();
        const normalOffset = normal.clone().multiplyScalar(0.1);
        const pos: BlockPos = {
            x: Math.floor(point.x - normalOffset.x),
            y: Math.floor(point.y - normalOffset.y),
            z: Math.floor(point.z - normalOffset.z),
        };
        const block = Game.main.level.getBlockAt(pos);
        if (!block) {
            return;
        }

        const face = blockFaceByNormal(hitFace.normal);
        if (!face) {
            return;
        }

        return { pos, block, face, point };
    }
}
