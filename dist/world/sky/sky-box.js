import { AdditiveBlending, Mesh, MeshStandardMaterial, Object3D, PlaneGeometry, TextureLoader, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";
var SkyBox = /** @class */ (function () {
    function SkyBox(camera) {
        this.camera = camera;
        this.sunHolder = new Object3D();
        this.sunGeometry = new PlaneGeometry(200, 200);
        this.sunMesh = new Mesh(this.sunGeometry, new MeshStandardMaterial({ blending: AdditiveBlending }));
    }
    SkyBox.prototype.register = function (scene) {
        this.sunHolder.add(this.sunMesh);
        this.sunMesh.position.set(0, 0, 1000);
        scene.add(this.sunHolder);
        var sunTexture = new TextureLoader().load('textures/sun.png');
        this.sunMesh.material.map = sunTexture;
    };
    SkyBox.prototype.update = function (dayPhase) {
        var camPos = this.camera.position;
        this.sunHolder.position.set(camPos.x, camPos.y, camPos.z);
        this.sunHolder.rotation.setFromVector3(new Vector3(degToRad(dayPhase * 360 - 90), 0, 0));
        this.sunMesh.lookAt(this.camera.position);
    };
    return SkyBox;
}());
export { SkyBox };
