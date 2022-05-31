import { sumBlockPos } from '../block/block-pos';
import { Blocks } from '../block/blocks';
import { manhattenDistance } from '../light/flood-fill';
import { Player } from '../player/player';
import { indexToPos } from '../util/index-to-vector3';
import { World } from '../world/world';
import { Item, UseAction } from './item';

const BLAST_DIAMETER = 32;

export class BombItem extends Item {
    public constructor() {
        super('bomb', 'Bomb');
    }

    public onUse(action: UseAction, world: World, player: Player): boolean {
        if (action !== UseAction.Primary) {
            return false;
        }

        const facing = player.getFacingBlock();
        if (!facing) {
            return false;
        }
        const { pos: originPos, point } = facing;

        for (let i = 0; i < BLAST_DIAMETER * BLAST_DIAMETER * BLAST_DIAMETER; i++) {
            const pos = indexToPos(i, BLAST_DIAMETER).subScalar(BLAST_DIAMETER / 2);
            const dist = manhattenDistance({ x: 0, y: 0, z: 0 }, pos);
            if (dist > BLAST_DIAMETER / 2) {
                continue;
            }

            const worldPos = sumBlockPos(pos, originPos);
            world.setBlock(worldPos, Blocks.AIR);
        }

        world.playSound3D('generic.explosion', point);

        return true;
    }
}
