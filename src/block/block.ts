import { BlockModel } from './block-model/block-model';
import { BlockPos } from './block-pos';
import { BlockState } from './block-state/block-state';
import { Level } from '../level';
import { World } from '../world/world';
import { Player } from '../player/player';

export abstract class Block {
    public readonly isFoliage: boolean = false;
    public readonly blocksLight: boolean = true;
    public readonly occludesNeighborBlocks: boolean = true;

    public constructor(
        public readonly name: string,
        public readonly displayName: string,
        public readonly blockModels: BlockModel[],
    ) {}

    public onRandomTick(level: Level, pos: BlockPos): void {}
    public getBlockModel(blockState: BlockState): number { return 0; }
    public getLightLevel(): number { return 0; }

    public onSetBlock(world: World, pos: BlockPos): void {}

    public onPlace(player: Player, world: World, pos: BlockPos): void {}
    public onBreak(world: World, pos: BlockPos): void {}
    public onInteract(world: World, pos: BlockPos): boolean { return false; }

    public isCollidable(world: World, pos: BlockPos): boolean { return true; }
}
