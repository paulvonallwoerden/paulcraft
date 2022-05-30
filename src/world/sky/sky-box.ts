import { AdditiveBlending, Camera, DoubleSide, Mesh, MeshStandardMaterial, Object3D, PlaneGeometry, Scene, TextureLoader, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";

export class SkyBox {
    private readonly sunHolder = new Object3D();
    private readonly sunGeometry = new PlaneGeometry(200, 200);
    private readonly sunMesh = new Mesh(this.sunGeometry, new MeshStandardMaterial({ blending: AdditiveBlending }));

    public constructor(private readonly camera: Camera) {}

    public register(scene: Scene) {
        this.sunHolder.add(this.sunMesh);
        this.sunMesh.position.set(0, 0, 1000);
        scene.add(this.sunHolder);

        const sunTexture = new TextureLoader().load('textures/sun.png');
        this.sunMesh.material.map = sunTexture;
    }

    public update(dayPhase: number) {
        const camPos = this.camera.position;
        this.sunHolder.position.set(camPos.x, camPos.y, camPos.z);
        this.sunHolder.rotation.setFromVector3(new Vector3(degToRad(dayPhase * 360 - 90), 0, 0));

        this.sunMesh.lookAt(this.camera.position);
    }
}
