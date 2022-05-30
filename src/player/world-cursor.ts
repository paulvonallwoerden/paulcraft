import { BoxGeometry, Mesh, Object3D, Scene, Vector3, Vector3Tuple } from 'three';
import { BlockFace } from '../block/block-face';
import { BlockModelRenderer, ElementFromToModifier, SolidityMap } from '../block/block-model/block-model-renderer';
import { BlockPos } from '../block/block-pos';
import { Blocks } from '../block/blocks';
import { computeBoundingBox } from '../util/bounding-box';
import { createWorldCursorMaterial } from './world-cursor-material';
import { World } from '../world/world';

const BLOCK_CURSOR_SOLIDITY_MAP: SolidityMap = {
    [BlockFace.TOP]: false,
    [BlockFace.BOTTOM]: false,
    [BlockFace.LEFT]: false,
    [BlockFace.RIGHT]: false,
    [BlockFace.FRONT]: false,
    [BlockFace.BACK]: false,
}

const BlockCursorOverlap = 0.05;

export class WorldCursor {
    private readonly material = createWorldCursorMaterial();
    private readonly parent = new Object3D();

    private readonly blockModelRenderer: BlockModelRenderer;

    public constructor(blocks: Blocks) {
        const elementFromToModifier: ElementFromToModifier = ([from, to]) => [
            from.map((value) => value - BlockCursorOverlap) as Vector3Tuple,
            to.map((value) => value + BlockCursorOverlap) as Vector3Tuple,
        ];
        this.blockModelRenderer = new BlockModelRenderer(blocks.serializeBlockModels().textureUvs, elementFromToModifier);
    }

    public register(scene: Scene) {
        scene.add(this.parent);
    }

    public set(world: World, pos: BlockPos): void {
        this.hide();

        // const block = world.getBlock(pos);
        // const state = world.getBlockState(pos);
        // if (!block) {
        //     return;
        // }

        // const modelIndex = state ? block.getBlockModel(state) : 0;
        // const model = block.blockModels[modelIndex];
        // const modelMesh = this.blockModelRenderer.render(new Vector3(pos.x, pos.y, pos.z), model, BLOCK_CURSOR_SOLIDITY_MAP);

        // const points = [];
        // for (let i = 0; i < modelMesh.vertices.length; i += 3) {
        //     points.push(new Vector3(
        //         modelMesh.vertices[i],
        //         modelMesh.vertices[i + 1],
        //         modelMesh.vertices[i + 2],
        //     ));
        // }

        // const boundingBox = computeBoundingBox(points);
        // const [width, height, depth] = boundingBox.getSize(new Vector3()).toArray();
        // const boundingBoxGeometry = new BoxGeometry(width, height, depth);

        // const mesh = new Mesh(boundingBoxGeometry, this.material);
        // mesh.position.x = boundingBox.min.x + width / 2;
        // mesh.position.y = boundingBox.min.y + height / 2;
        // mesh.position.z = boundingBox.min.z + depth / 2;
        // this.parent.add(mesh);
    }

    private hide() {
        this.parent.clear();
    }
}
