import { Box3, Vector3, Vector3Tuple } from "three";
import { Block } from "../../block/block";
import { computeBoundingBox } from "../../util/bounding-box";
import { xyzTupelToIndex } from "../../util/index-to-vector3";

export interface WorldFeatureBuilder {
    setBlock(position: Vector3Tuple, blockId: number): void;
}

export interface WorldFeature1 {
    place(position: Vector3Tuple, builder: WorldFeatureBuilder): void;
}

export type ElementBlock = { at: Vector3Tuple, block: Block }
export type ElementShape = { from: Vector3Tuple, to: Vector3Tuple, block: Block, shape: 'cube' }
export type VariantElement = ElementBlock | ElementShape;

export interface FeatureVariant {
    weight?: number;
    elements: VariantElement[];
}

export interface WorldFeature {
    force?: boolean;
    placeOn?: Block;
    variants: FeatureVariant[];
}

export type BuildFeatureVariantResult = { blocks: (Block | undefined)[], width: number, height: number, depth: number };
export function buildFeatureVariant(variant: FeatureVariant): BuildFeatureVariantResult {
    const { elements } = variant;
    const boundingBox = getFeatureVariantBoundingBox(variant);
    const [minX, minY, minZ] = boundingBox.min.toArray();
    const [width, height, depth] = boundingBox.getSize(new Vector3()).add(new Vector3(1, 1, 1)).toArray();

    const blocks: Block[] = [];
    elements.forEach((element) => {
        if ('at' in element) {
            const [x, y, z] = element.at;
            blocks[xyzTupelToIndex(x - minX, y - minY, z - minZ, width, depth)] = element.block;

            return;
        }

        const [x1, y1, z1] = element.from;
        const [x2, y2, z2] = element.to;
        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                for (let z = z1; z <= z2; z++) {
                    blocks[xyzTupelToIndex(x - minX, y - minY, z - minZ, width, depth)] = element.block;
                }
            }
        }
    });

    return { blocks, width, height, depth };
}

function getFeatureVariantBoundingBox(variant: FeatureVariant): Box3 {
    const { elements } = variant;
    const points = elements.reduce<Vector3[]>((points, element) => {
        if ('at' in element) {
            return [...points, new Vector3().fromArray(element.at)];
        }

        return [...points, new Vector3().fromArray(element.from), new Vector3().fromArray(element.to)];
    }, []);

    return computeBoundingBox(points);
}

// Tree
// Cactus
// Grass
// Flower
// Pumpkins

