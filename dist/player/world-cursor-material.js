import { MultiplyBlending, ShaderMaterial } from "three";
var vertexShader = "\n    varying vec2 vUv;\n    void main()\t{\n        vUv = uv;\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n    }\n";
var fragmentShader = "\n    //#extension GL_OES_standard_derivatives : enable\n\n    varying vec2 vUv;\n    uniform float thickness;\n\n    float edgeFactor(vec2 p) {\n        vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p) / thickness;\n        return min(grid.x, grid.y);\n    }\n\n    void main() {\n        float a = edgeFactor(vUv);\n        vec3 c = mix(vec3(0), vec3(1), a);\n        gl_FragColor = vec4(c, 0.5);\n    }\n";
export function createWorldCursorMaterial() {
    return new ShaderMaterial({
        uniforms: {
            thickness: { value: 4 },
        },
        blending: MultiplyBlending,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
}
