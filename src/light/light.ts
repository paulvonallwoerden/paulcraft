import { BlockPos } from '../block/block-pos';

export interface LightSource {
    readonly position: BlockPos;
    readonly radius: number;
}
