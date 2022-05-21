import { BufferGeometry, CylinderGeometry, Line, LineBasicMaterial, Mesh, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";
var OriginCross = /** @class */ (function () {
    function OriginCross() {
        this.materialX = new LineBasicMaterial({ color: 0xff0000 });
        this.materialY = new LineBasicMaterial({ color: 0x00ff00 });
        this.materialZ = new LineBasicMaterial({ color: 0x0000ff });
        this.geometryX = new CylinderGeometry(0.05, 0.05, 1, 8, 1);
        this.geometryY = new CylinderGeometry(0.05, 0.05, 1, 8, 1);
        this.geometryZ = new CylinderGeometry(0.05, 0.05, 1, 8, 1);
        this.meshX = new Mesh(this.geometryX, this.materialX);
        this.meshY = new Mesh(this.geometryY, this.materialY);
        this.meshZ = new Mesh(this.geometryZ, this.materialZ);
    }
    OriginCross.prototype.addToScene = function (scene) {
        this.meshX.position.setX(0.5);
        this.meshX.rotateZ(degToRad(90));
        this.meshY.position.setY(0.5);
        this.meshZ.position.setZ(0.5);
        this.meshZ.rotateX(degToRad(90));
        scene.add(this.meshX, this.meshY, this.meshZ);
    };
    return OriginCross;
}());
export { OriginCross };
var ThinOriginCross = /** @class */ (function () {
    function ThinOriginCross() {
        this.materialX = new LineBasicMaterial({ color: 0xff0000 });
        this.materialY = new LineBasicMaterial({ color: 0x00ff00 });
        this.materialZ = new LineBasicMaterial({ color: 0x0000ff });
        this.pointsX = [new Vector3(0, 0, 0), new Vector3(1, 0, 0)];
        this.pointsY = [new Vector3(0, 0, 0), new Vector3(0, 1, 0)];
        this.pointsZ = [new Vector3(0, 0, 0), new Vector3(0, 0, 1)];
        this.geometryX = new BufferGeometry().setFromPoints(this.pointsX);
        this.geometryY = new BufferGeometry().setFromPoints(this.pointsY);
        this.geometryZ = new BufferGeometry().setFromPoints(this.pointsZ);
        this.lineX = new Line(this.geometryX, this.materialX);
        this.lineY = new Line(this.geometryY, this.materialY);
        this.lineZ = new Line(this.geometryZ, this.materialZ);
    }
    ThinOriginCross.prototype.addToScene = function (scene) {
        scene.add(this.lineX, this.lineY, this.lineZ);
    };
    return ThinOriginCross;
}());
export { ThinOriginCross };
