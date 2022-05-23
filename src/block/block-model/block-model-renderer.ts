import { Euler, Matrix4, Quaternion, Vector2Tuple, Vector3, Vector3Tuple } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { BlockFace, BlockFaces } from "../block-face";
import { SerializedBlockModels } from "../blocks";
import { BlockModel, BlockModelElement, BlockModelFace, BlockModelRotation } from "./block-model";

export type SolidityMap = Record<BlockFace, boolean>;

export interface BlockModelMesh {
    vertices: number[];
    triangles: number[];
    normals: number[];
    uv: number[];
}

const FaceNormals = {
    [BlockFace.TOP]: [0, 1, 0],
    [BlockFace.BOTTOM]: [0, -1, 0],
    [BlockFace.LEFT]: [1, 0, 0],
    [BlockFace.RIGHT]: [-1, 0, 0],
    [BlockFace.FRONT]: [0, 0, 1],
    [BlockFace.BACK]: [0, 0, -1],
} as const;

const FaceTrsMatrices: Record<BlockFace, Matrix4> = {
    [BlockFace.TOP]: new Matrix4().compose(
        new Vector3(0, 1, 1),
        new Quaternion().setFromEuler(new Euler(degToRad(-90), 0, 0), true),
        new Vector3(1, 1, 1),
    ),
    [BlockFace.BOTTOM]: new Matrix4().compose(
        new Vector3(0, 0, 0),
        new Quaternion().setFromEuler(new Euler(degToRad(90), 0, 0), true),
        new Vector3(1, 1, 1),
    ),
    [BlockFace.LEFT]: new Matrix4().compose(
        new Vector3(1, 0, 1),
        new Quaternion().setFromEuler(new Euler(0, degToRad(90), 0), true),
        new Vector3(1, 1, 1),
    ),
    [BlockFace.RIGHT]: new Matrix4().compose(
        new Vector3(0, 0, 0),
        new Quaternion().setFromEuler(new Euler(0, degToRad(-90), 0), true),
        new Vector3(1, 1, 1),
    ),
    [BlockFace.FRONT]: new Matrix4().compose(
        new Vector3(0, 0, 1),
        new Quaternion().identity(),
        new Vector3(1, 1, 1),
    ),
    [BlockFace.BACK]: new Matrix4().compose(
        new Vector3(1, 0, 0),
        new Quaternion().setFromEuler(new Euler(0, degToRad(180), 0), true),
        new Vector3(1, 1, 1),
    ),
} as const;

const DefaultElementFromToModifier = (fromAndTo: [Vector3Tuple, Vector3Tuple]) => fromAndTo;
export type ElementFromToModifier = typeof DefaultElementFromToModifier;

export class BlockModelRenderer {
    public constructor(
        private readonly blockUvs: SerializedBlockModels['textureUvs'],
        private readonly elementFromToModifier = DefaultElementFromToModifier,
    ) {}

    public render(position: Vector3, blockModel: BlockModel, solidityMap: SolidityMap): BlockModelMesh {
        return blockModel.elements.reduce<BlockModelMesh>(
            (mesh, element) => this.renderElement(blockModel, position, element, solidityMap, mesh),
            {
                normals: [],
                triangles: [],
                uv: [],
                vertices: [],
            },
        );
    }

    protected renderElement(
        blockModel: BlockModel,
        position: Vector3,
        element: BlockModelElement,
        solidityMap: SolidityMap,
        mesh: BlockModelMesh,
    ): BlockModelMesh {
        return BlockFaces.reduce((modifiedMesh, blockFace) => {
            const modelFace = element.faces[blockFace];
            if (modelFace === undefined) {
                return modifiedMesh;
            }

            return this.renderFace(
                blockModel,
                position,
                element,
                modelFace,
                blockFace,
                solidityMap,
                modifiedMesh
            );
        }, mesh);
    }

    protected renderFace<T extends BlockFace>(
        blockModel: BlockModel,
        position: Vector3,
        element: BlockModelElement,
        modelFace: BlockModelFace,
        blockFace: T,
        solidityMap: SolidityMap,
        mesh: BlockModelMesh,
    ): BlockModelMesh {
        if (modelFace.cull && solidityMap[blockFace] === true) {
            return mesh;
        }

        // Vertices
        const [[fromX, fromY, fromZ], [toX, toY, toZ]] = this.elementFromToModifier(this.normalizeToFrom(element.from, element.to));
        const [sizeX, sizeY, sizeZ] = [toX - fromX, toY - fromY, toZ - fromZ];
        const modelMatrix = this.makeTrsMatrixFromBlockModelRotation(blockModel.rotation);
        const elementMatrix = this.makeTrsMatrixFromBlockModelRotation(element.rotation);
        const faceMatrix = new Matrix4().compose(
            new Vector3(fromX / 15, fromY / 15, fromZ / 15),
            new Quaternion().identity(),
            new Vector3(sizeX / 15, sizeY / 15, sizeZ / 15),
        );

        const rts = modelMatrix
            .multiply(elementMatrix)
            .multiply(faceMatrix)
            .multiply(FaceTrsMatrices[blockFace]);

        mesh.vertices.push(
            ...new Vector3(0, 0, 0).applyMatrix4(rts).add(position).toArray(),
            ...new Vector3(1, 0, 0).applyMatrix4(rts).add(position).toArray(),
            ...new Vector3(0, 1, 0).applyMatrix4(rts).add(position).toArray(),
            ...new Vector3(1, 1, 0).applyMatrix4(rts).add(position).toArray(),
        );

        // Triangles
        const triangleOffset = (mesh.vertices.length / 3) - 4;
        mesh.triangles.push(
            triangleOffset,
            triangleOffset + 1,
            triangleOffset + 2,

            triangleOffset + 2,
            triangleOffset + 1,
            triangleOffset + 3,
        );

        // Normals
        for (let i = 0; i < 4; i++) {
            mesh.normals.push(...FaceNormals[blockFace]);
        }

        // UVs
        const { texture } = modelFace;
        const [uvScaleX, uvScaleY, uvScaleZ] = [sizeX / 16, sizeY / 16, sizeZ / 16];
        const uvs = this.blockUvs[texture];
        switch (blockFace) {
            case BlockFace.FRONT:
            case BlockFace.BACK:
                mesh.uv.push(...this.scaleUvs(uvs, [0, 0], [uvScaleX, uvScaleY]));
                break;
            case BlockFace.LEFT:
            case BlockFace.RIGHT:
                mesh.uv.push(...this.scaleUvs(uvs, [0, 0], [uvScaleZ, uvScaleY]));
                break;
            case BlockFace.TOP:
            case BlockFace.BOTTOM:
                mesh.uv.push(...this.scaleUvs(uvs, [0, 0], [uvScaleX, uvScaleZ]));
                break;
            default:
                mesh.uv.push(...uvs);
                break;
        }

        return mesh;
    }

    // TODO: This method sucks. It's hard to understand. Make it better.
    protected scaleUvs(uvs: number[], offset: Vector2Tuple, scale: Vector2Tuple): number[] {
        return [
            offset[0] + uvs[0], offset[1] + uvs[1],
            offset[0] + uvs[2] - (1 / 16) * (1 - scale[0]), offset[1] + uvs[3],
            offset[0] + uvs[4], offset[1] + uvs[5] - (1 / 16) * (1 - scale[1]),
            offset[0] + uvs[6] - (1 / 16) * (1 - scale[0]), offset[1] + uvs[7] - (1 / 16) * (1 - scale[1]),
        ];
    }

    protected makeTrsMatrixFromBlockModelRotation(rotation?: BlockModelRotation): Matrix4 {
        if (rotation === undefined) {
            return new Matrix4().identity();
        }

        const rotationMatrix = new Matrix4().makeRotationAxis(
            new Vector3(
                rotation.axis === 'x' ? 1 : 0,
                rotation.axis === 'y' ? 1 : 0,
                rotation.axis === 'z' ? 1 : 0,
            ),
            degToRad(rotation.angle),
        )
        if (rotation.origin === undefined) {
            return rotationMatrix;
        }

        const [originX, originY, originZ] = rotation.origin;
        const shiftMatrix = new Matrix4().makeTranslation(originX, originY, originZ);
        const deShiftMatrix = new Matrix4().makeTranslation(-originX, -originY, -originZ);

        return shiftMatrix.multiply(rotationMatrix).multiply(deShiftMatrix);
    }

    protected normalizeToFrom(from: Vector3Tuple, to: Vector3Tuple): [Vector3Tuple, Vector3Tuple] {
        return [
            [Math.min(from[0], to[0]), Math.min(from[1], to[1]), Math.min(from[2], to[2])],
            [Math.max(from[0], to[0]), Math.max(from[1], to[1]), Math.max(from[2], to[2])],
        ];
    }
}
