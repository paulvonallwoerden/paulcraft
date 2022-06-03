import { Camera, Mesh, MeshBasicMaterial, NearestFilter, OrthographicCamera, Scene, TextureLoader, Vector2, WebGLRenderer } from 'three';
import { Game } from '../game';
import { makeTextMaterial } from '../shader/text-shader';
import { FontRenderer } from './font-renderer';
import { UiInterface } from './ui-interface';

export class UiManager {
    public readonly fontRenderer: FontRenderer = new FontRenderer();
    public readonly textMaterial = makeTextMaterial();

    public readonly scene = new Scene();
    public readonly camera = new OrthographicCamera(-10, 10, 10, -10, -10, 10);
    private readonly size = new Vector2();

    private readonly activeInterfaces: UiInterface[] = [];
    private readonly interfaceMeshes: Map<UiInterface, Mesh[]> = new Map();

    public constructor() {}

    public setScreenSize(width: number, height: number) {
        const scale = 0.04;
        this.camera.bottom = 0;
        this.camera.left = 0;
        this.camera.right = width * scale;
        this.camera.top = height * scale;
        this.camera.updateProjectionMatrix();

        this.size.set(width * scale, height * scale);
    }

    public async show(uiInterface: UiInterface): Promise<void> {
        this.activeInterfaces.push(uiInterface);
        await uiInterface.init(this);
    }

    public async hide(uiInterface: UiInterface): Promise<void> {
        this.scene.remove(...this.interfaceMeshes.get(uiInterface) ?? []);
        this.interfaceMeshes.set(uiInterface, []);
        this.activeInterfaces.splice(this.activeInterfaces.indexOf(uiInterface), 1);
    }

    public render(deltaTime: number): void {
        this.activeInterfaces.forEach((ui) => ui.draw(this.size, deltaTime));
        this.activeInterfaces.forEach((ui) => ui.onAfterDraw(this, new Vector2(640, 480)));
    }

    public addMesh(uiInterface: UiInterface, mesh: Mesh) {
        mesh.frustumCulled = false;
        this.scene.add(mesh);

        this.interfaceMeshes.set(uiInterface, [...this.interfaceMeshes.get(uiInterface) ?? [], mesh]);
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
