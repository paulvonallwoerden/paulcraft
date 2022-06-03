import { BoxGeometry, Mesh, MeshBasicMaterial, TextureLoader, Vector3 } from 'three';
import { Block } from '../block/block';
import { getBlockModelTextures } from '../block/block-model/block-model';
import { BlockPos, floorBlockPos } from '../block/block-pos';
import { Blocks } from '../block/blocks';
import { World } from '../world/world';

export abstract class Entity {
    public readonly position = new Vector3();

    public constructor(protected readonly world: World) {}

    public abstract update(deltaTime: number): void;
    public abstract getMesh(): Mesh;

    public destroy() {
        this.world.entityManager.remove(this);
    }
}

export class FallingBlockEntity extends Entity {
    private velocity: number = 0;

    public constructor(
        world: World,
        private readonly block: Block,
        position: BlockPos,
    ) {
        super(world);

        this.position.set(position.x + 0.5, position.y + 0.5, position.z + 0.5);
    }

    public update(deltaTime: number): void {
        const blockPos = floorBlockPos({
            x: this.position.x,
            y: this.position.y,
            z: this.position.z,
        });
        const blockBelow = this.world.getBlock({ x: blockPos.x, y: blockPos.y - 1, z: blockPos.z });
        if (blockBelow === Blocks.AIR) {
            this.fall(deltaTime);

            return;
        }

        this.world.setBlock(blockPos, this.block);
        this.destroy();
    }

    private fall(deltaTime: number) {
        this.velocity += deltaTime * 0.00002;
        this.position.setY(this.position.y - this.velocity * deltaTime);
    }

    public getMesh(): Mesh {
        const mapSrc = getBlockModelTextures(this.block.blockModels[0])[0];
        const map = new TextureLoader().load(mapSrc);
        const material = new MeshBasicMaterial({ map });
        const geometry = new BoxGeometry(1, 1, 1);

        return new Mesh(geometry, material);
    }
}
