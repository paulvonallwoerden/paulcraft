import { Camera, Mesh, MeshBasicMaterial, NearestFilter, OrthographicCamera, Scene, TextureLoader, Vector2, WebGLRenderer } from 'three';
import { Game } from '../game';
import { makeTextMaterial } from '../shader/text-shader';
import { FontRenderer } from './font-renderer';
import { UiInterface } from './ui-interface';

export class UiManager {
    public readonly fontRenderer: FontRenderer = new FontRenderer();
    public readonly textMaterial = makeTextMaterial();

    public readonly scene = new Scene();
    public readonly camera = new OrthographicCamera(-10, 10, 10, -10, 0, 1);
    private readonly size = new Vector2();

    private readonly activeInterfaces: UiInterface[] = [];

    public constructor() {}

    public setScreenSize(width: number, height: number) {
        const scale = 0.05;
        this.camera.bottom = 0;
        this.camera.left = 0;
        this.camera.right = width * scale;
        this.camera.top = height * scale;
        this.camera.updateProjectionMatrix();

        this.size.set(width * scale, height * scale);
    }

    public show(uiInterface: UiInterface) {
        this.activeInterfaces.push(uiInterface);
        uiInterface.init(this);
    }

    public render(): void {
        this.activeInterfaces.forEach((ui) => ui.draw(this.size));
        this.activeInterfaces.forEach((ui) => ui.onAfterDraw(this, new Vector2(640, 480)));
    }

    public addMesh(mesh: Mesh) {
        mesh.frustumCulled = false;
        this.scene.add(mesh);
    }

    public async load(): Promise<void> {
        const fontTexture = new TextureLoader().load('textures/ascii.png', (texture) => {
            fontTexture.minFilter = NearestFilter;
            fontTexture.magFilter = NearestFilter;
            this.fontRenderer.calculateGlyphWidths(texture);
            this.textMaterial.uniforms.uTexture.value = fontTexture;
        });
    }
}
