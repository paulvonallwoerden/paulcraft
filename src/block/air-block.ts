import { Block } from "./block";
import { BlockModel } from "./block-model/block-model";

export const AirBlockModel: BlockModel = {
    elements: [],
}

export class AirBlock extends Block {
    public constructor() {
        super('air', [AirBlockModel]);
    }

    public isCollidable(): boolean {
        return false;
    }
}
