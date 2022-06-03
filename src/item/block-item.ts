import { Block } from '../block/block';
import { normalByBlockFace } from '../block/block-face';
import { getBlockModelTextures } from '../block/block-model/block-model';
import { floorBlockPos } from '../block/block-pos';
import { Blocks } from '../block/blocks';
import { Player } from '../player/player';
import { World } from '../world/world';
import { Item, UseAction } from './item';

export class BlockItem extends Item {
    public constructor(private readonly block: Block) {
        super(block.name, block.displayName);
    }

    public onUse(action: UseAction, world: World, player: Player): boolean {
        const facingBlock = player.getFacingBlock();
        if (!facingBlock) {
            return false;
        }
        const { block, face, pos, point } = facingBlock;
        if (action === UseAction.Primary) {
            world.setBlock(pos, Blocks.AIR);
            block.onBreak(world, pos);

            return true;
        }

        player.inventory.take(this);

        const normal = normalByBlockFace(face);
        const placePos = floorBlockPos({ x: point.x + normal.x * 0.1, y: point.y + normal.y * 0.1, z: point.z + normal.z * 0.1 });
        world.setBlock(placePos, this.block);

        this.block.onPlace(player, world, placePos);

        return true;
    }

    public getDisplayImage(): string {
        const blockModel = this.block.blockModels[0];

        return blockModel.itemTexture ?? getBlockModelTextures(blockModel)[0];
    }
}
