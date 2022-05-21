import { Level } from "../level";
import { World } from "../world/world";
import { BlockModel } from "./block-model/block-model";
import { BlockPos } from "./block-pos";
import { BlockState } from "./block-state/block-state";

export abstract class Block {
    public constructor(
        public readonly name: string,
        public readonly blockModels: BlockModel[],
    ) {}

    public getBlockModel(blockState: BlockState): number { return 0; }
    public onRandomTick(level: Level, pos: BlockPos): void {}

    public onSetBlock(world: World, pos: BlockPos): void {}

    public onPlace(world: World, pos: BlockPos): boolean { return true; }
    public onBreak(world: World, pos: BlockPos): void {}
    public onInteract(world: World, pos: BlockPos): boolean { return false; }
    public isCollidable(world: World, pos: BlockPos): boolean { return true; }
}
