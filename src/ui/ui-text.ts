import { BufferAttribute, Color, Matrix4, Mesh, Vector2 } from 'three';
import { UiElement } from './ui-element';
import { UiManager } from './ui-manager';

export class UiText extends UiElement {
    private readonly mesh = new Mesh();

    private text: string = 'New Text';
    private width = 0;

    private color = new Color(1, 1, 1);
    private alpha = 1;

    public setText(text: string): void {
        if (this.text === text) {
            return;
        }

        this.text = text;
        this.setDirty();
    }

    public setColor(color: Color, alpha = 1) {
        if (this.color.equals(color) && this.alpha === alpha) {
            return;
        }

        this.color = color;
        this.alpha = alpha;
        this.setDirty();
    }

    public draw(ui: UiManager, screenSize: Vector2): void {
        const { geometry, width, vertexCount } = ui.fontRenderer.render(this.text);
        this.width = width;

        geometry.setAttribute('color', new BufferAttribute(new Float32Array(vertexCount * 4).fill(this.alpha), 4));

        this.mesh.geometry = geometry;
        this.mesh.material = ui.textMaterial;
        this.mesh.position.set(this.position.x, this.position.y, this.uiInterface.zIndex);
    }

    public async onAdd(ui: UiManager): Promise<void> {
        ui.addMesh(this.uiInterface, this.mesh);
    }

    public getTextWidth(): number {
        return this.width;
    }
}
