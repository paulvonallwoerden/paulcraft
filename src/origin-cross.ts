import { BufferGeometry, CylinderGeometry, Line, LineBasicMaterial, Mesh, Scene, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";

export class OriginCross {
    private readonly materialX = new LineBasicMaterial( { color: 0xff0000 } );
    private readonly materialY = new LineBasicMaterial( { color: 0x00ff00 } );
    private readonly materialZ = new LineBasicMaterial( { color: 0x0000ff } );

    private readonly geometryX = new CylinderGeometry(0.05, 0.05, 1, 8, 1);
    private readonly geometryY = new CylinderGeometry(0.05, 0.05, 1, 8, 1);
    private readonly geometryZ = new CylinderGeometry(0.05, 0.05, 1, 8, 1);

    private readonly meshX = new Mesh(this.geometryX, this.materialX);
    private readonly meshY = new Mesh(this.geometryY, this.materialY);
    private readonly meshZ = new Mesh(this.geometryZ, this.materialZ);

    public addToScene(scene: Scene) {
        this.meshX.position.setX(0.5);
        this.meshX.rotateZ(degToRad(90));

        this.meshY.position.setY(0.5);

        this.meshZ.position.setZ(0.5);
        this.meshZ.rotateX(degToRad(90));

        scene.add(this.meshX, this.meshY, this.meshZ);
    }
}

export class ThinOriginCross {
    private readonly materialX = new LineBasicMaterial( { color: 0xff0000 } );
    private readonly materialY = new LineBasicMaterial( { color: 0x00ff00 } );
    private readonly materialZ = new LineBasicMaterial( { color: 0x0000ff } );

    private readonly pointsX = [new Vector3(0, 0, 0), new Vector3(1, 0, 0)];
    private readonly pointsY = [new Vector3(0, 0, 0), new Vector3(0, 1, 0)];
    private readonly pointsZ = [new Vector3(0, 0, 0), new Vector3(0, 0, 1)];
    
    private readonly geometryX = new BufferGeometry().setFromPoints(this.pointsX);
    private readonly geometryY = new BufferGeometry().setFromPoints(this.pointsY);
    private readonly geometryZ = new BufferGeometry().setFromPoints(this.pointsZ);

    private readonly lineX = new Line(this.geometryX, this.materialX);
    private readonly lineY = new Line(this.geometryY, this.materialY);
    private readonly lineZ = new Line(this.geometryZ, this.materialZ);

    public addToScene(scene: Scene) {
        scene.add(this.lineX, this.lineY, this.lineZ);
    }
}
