import { AdditiveBlending, Blending, BoxGeometry, ShaderMaterial, Vector3 } from "three";

const vertexShader = `
    varying vec2 vUv;
    void main()	{
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
`;

const fragmentShader = `
    //#extension GL_OES_standard_derivatives : enable

    varying vec2 vUv;
    uniform float thickness;

    float edgeFactor(vec2 p) {
        vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p) / thickness;
        return min(grid.x, grid.y);
    }

    void main() {
        float a = edgeFactor(vUv);
        vec3 c = mix(vec3(1), vec3(0), a);
        gl_FragColor = vec4(c, 1.0);
    }
`;

export function createWorldCursorMaterial() {
    return new ShaderMaterial({
        uniforms: {
            thickness: { value: 4 },
        },
        blending: AdditiveBlending,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
}
