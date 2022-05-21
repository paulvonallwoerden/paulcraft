import { BoxGeometry, BufferGeometry, Mesh, Object3D, Scene, Vector3Tuple, WireframeGeometry } from "three";
import { BlockModel } from "../block/block-model/block-model";
import { BlockPos } from "../block/block-pos";
import { World } from "../world/world";
import { createWorldCursorMaterial } from "./world-cursor-material";

export class WorldCursor {
    private readonly overlap = 0.001;
    private readonly material = createWorldCursorMaterial();
    private readonly parent = new Object3D();

    public register(scene: Scene) {
        scene.add(this.parent);
    }

    public set(world: World, pos: BlockPos): void {
        this.hide();

        const block = world.getBlock(pos);
        const state = world.getBlockState(pos);
        if (!block) {
            return;
        }

        const modelIndex = state ? block.getBlockModel(state) : 0;
        const model = block.blockModels[modelIndex];
        const meshes = this.buildMeshes(model, pos);
        this.parent.add(...meshes);
    }

    private hide() {
        this.parent.clear();
    }

    private buildMeshes(model: BlockModel, pos: BlockPos): Mesh[] {
        return model.elements.map((element) => {
            const [from, to] = this.normalizeToFrom(element.from, element.to);
            const [width, height, depth] = [
                (to[0] - from[0]) / 15 + this.overlap * 2,
                (to[1] - from[1]) / 15 + this.overlap * 2,
                (to[2] - from[2]) / 15 + this.overlap * 2,
            ];
            const newGeometry = new BoxGeometry(width, height, depth);
            newGeometry.translate(
                (pos.x + width / 2) + from[0] / 15 - this.overlap,
                (pos.y + height / 2) + from[1] / 15 - this.overlap,
                (pos.z + depth / 2) + from[2] / 15 - this.overlap,
            );

            return new Mesh(newGeometry, this.material);
        });
    }

    protected normalizeToFrom(from: Vector3Tuple, to: Vector3Tuple): [Vector3Tuple, Vector3Tuple] {
        return [
            [Math.min(from[0], to[0]), Math.min(from[1], to[1]), Math.min(from[2], to[2])],
            [Math.max(from[0], to[0]), Math.max(from[1], to[1]), Math.max(from[2], to[2])],
        ];
    }
}
