import { BufferAttribute, Matrix4, Mesh, Vector2 } from 'three';
import { UiElement } from './ui-element';
import { UiManager } from './ui-manager';

export class UiText extends UiElement {
    private readonly mesh = new Mesh();

    private text: string = 'New Text';
    private width = 0;

    public setText(text: string): void {
        if (this.text === text) {
            return;
        }

        this.text = text;
        this.setDirty();
    }

    public draw(ui: UiManager, screenSize: Vector2): void {
        const { geometry, width } = ui.fontRenderer.render(this.text);
        this.width = width;

        this.mesh.geometry = geometry;
        this.mesh.material = ui.textMaterial;
        this.mesh.position.set(this.position.x, this.position.y, 0);
    }

    public onAdd(ui: UiManager): void {
        ui.addMesh(this.mesh);
    }

    public getTextWidth(): number {
        return this.width;
    }
}
