import { Block } from '../block/block';

export function areBlockLightPropertiesEqual(a: Block, b: Block) {
    return (a === b) || (
        a.blocksLight === b.blocksLight
        && a.getLightLevel() === b.getLightLevel()
    );
}
