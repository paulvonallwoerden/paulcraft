import { Vector3Tuple, Vector4Tuple } from "three";
import { BlockFace } from "../block-face";

export interface BlockModel {
    readonly elements: {
        from: Vector3Tuple;
        to: Vector3Tuple;
        faces: Record<
            BlockFace,
            {
                texture: string;
                cull: boolean;
            }
        >;
    }[]
}
