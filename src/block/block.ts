import { Level } from "../level";
import { BlockModel } from "./block-model/block-model";
import { BlockPos } from "./block-pos";

export abstract class Block {
    public constructor(
        public readonly name: string,
        public readonly blockModels: BlockModel[],
    ) {}

    public abstract getBlockModel(level: Level, pos: BlockPos): number;
    public onRandomTick(level: Level, pos: BlockPos): void {}
}
