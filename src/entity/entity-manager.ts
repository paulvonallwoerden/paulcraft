import { Mesh, Scene } from 'three';
import { Entity } from './falling-block-entity';

export class EntityManager {
    private readonly entities: Entity[] = [];
    private readonly entityMeshes: Mesh[] = [];

    public constructor(private readonly scene: Scene) {}

    public add(entity: Entity) {
        const mesh = entity.getMesh();
        this.scene.add(mesh);

        this.entities.push(entity);
        this.entityMeshes.push(mesh);
    }

    public remove(entity: Entity) {
        const index = this.entities.indexOf(entity);

        this.entities.splice(index, 1);
        const mesh = this.entityMeshes.splice(index, 1);
        this.scene.remove(...mesh);
    }

    public update(deltaTime: number) {
        for (const entity of this.entities) {
            entity.update(deltaTime);
        }
    }

    public lateUpdate(deltaTime: number) {
        for (let i = 0; i < this.entities.length; i++) {
            this.entityMeshes[i].position.set(
                this.entities[i].position.x,
                this.entities[i].position.y,
                this.entities[i].position.z,
            );
        }
    }
}
