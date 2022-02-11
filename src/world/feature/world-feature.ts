import { Vector3Tuple } from "three";

export interface WorldFeatureBuilder {
    setBlock(position: Vector3Tuple, blockId: number): void;
}

export interface WorldFeature {
    place(position: Vector3Tuple, builder: WorldFeatureBuilder): void;
}
