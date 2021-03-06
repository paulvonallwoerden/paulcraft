import { Vector3Tuple } from 'three';
import { BlockFace } from '../block-face';

export interface BlockModelRotation {
    axis: 'x' | 'y' | 'z';
    angle: number;
    origin?: Vector3Tuple;
}

export interface BlockModelFace {
    readonly cull?: boolean;
    readonly texture: string;
    readonly lockUv?: boolean;
}

export interface BlockModelElement {
    readonly from: Vector3Tuple;
    readonly to: Vector3Tuple;
    readonly faces: Partial<Record<BlockFace, BlockModelFace>>;
    readonly rotation?: BlockModelRotation;
}

export interface BlockModel {
    readonly itemTexture?: string;
    readonly elements: BlockModelElement[];
    readonly rotation?: BlockModelRotation;
}

export function getBlockModelTextures(blockModel: BlockModel) {
    const faces = blockModel.elements.flatMap((element) => Object.values(element.faces));

    return faces.map((face) => face.texture);
}
