import { ColorRepresentation, Mesh, MeshBasicMaterial, MeshBasicMaterialParameters, NearestFilter, PlaneGeometry, RepeatWrapping, TextureLoader, Vector2 } from 'three';
import { UiElement } from './ui-element';
import { UiInterface } from './ui-interface';
import { UiManager } from './ui-manager';

export class UiImage extends UiElement {
    private readonly mesh = new Mesh();

    private size = new Vector2();
    private material: MeshBasicMaterial;

    public constructor(ui: UiInterface, private src?: string, parameters?: MeshBasicMaterialParameters) {
        super(ui);

        this.material = new MeshBasicMaterial(parameters);
    }

    public setSize(size: Vector2) {
        this.size = size;
    }

    public setRepeat(repeat: Vector2) {
        if (!this.material.map) {
            return;
        }

        this.material.map.repeat = repeat;
    }

    public setColor(color: ColorRepresentation) {
        this.material.color.set(color);
    }

    public async setSrc(src: string) {
        if (this.src === src) {
            return;
        }

        this.src = src;
        await this.loadTexture(src);
        this.setDirty();
    }

    public draw(ui: UiManager, screenSize: Vector2): void {
        const geometry = new PlaneGeometry(this.size.x, this.size.y);
        this.mesh.geometry = geometry;
        this.mesh.material = this.material;

        this.mesh.position.set(this.position.x, this.position.y, this.uiInterface.zIndex);
    }

    public async onAdd(ui: UiManager): Promise<void> {
        ui.addMesh(this.uiInterface, this.mesh);
        if (this.src) {
            await this.loadTexture(this.src);
        }
    }

    private async loadTexture(src: string) {
        const texture = await new TextureLoader().loadAsync(src);
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        this.material.map = texture;
        this.material.needsUpdate = true;
    }
}
