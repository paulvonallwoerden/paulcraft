import { ShaderMaterial } from 'three';
export var vertexShader = "\n    attribute vec2 vPos;\n    varying vec2 vUv;\n\n    void main() {\n        vUv = uv;\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }\n";
export var fragmentShader = "\n    uniform sampler2D uTexture;\n\n    varying vec2 vUv;\n\n    void main() {\n        gl_FragColor = texture2D(uTexture, vUv);\n    }\n";
export function makeTextMaterial(map) {
    return new ShaderMaterial({
        uniforms: {
            uTexture: { value: map },
        },
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        transparent: true,
    });
}
