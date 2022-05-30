import { MeshStandardMaterial, DoubleSide } from 'three';
var vertexShader = "\n    varying vec2 vUv;\n    uniform float time;\n\n    vec3 mod289(vec3 x) {\n        return x - floor(x * (1.0 / 289.0)) * 289.0;\n    }\n    \n    vec4 mod289(vec4 x) {\n        return x - floor(x * (1.0 / 289.0)) * 289.0;\n    }\n    \n    vec4 permute(vec4 x) {\n        return mod289(((x*34.0)+1.0)*x);\n    }\n    \n    vec4 taylorInvSqrt(vec4 r)\n    {\n        return 1.79284291400159 - 0.85373472095314 * r;\n    }\n    \n    float snoise(vec3 v)\n    { \n        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n        // First corner\n        vec3 i  = floor(v + dot(v, C.yyy) );\n        vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n        // Other corners\n        vec3 g = step(x0.yzx, x0.xyz);\n        vec3 l = 1.0 - g;\n        vec3 i1 = min( g.xyz, l.zxy );\n        vec3 i2 = max( g.xyz, l.zxy );\n\n        //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n        //   x1 = x0 - i1  + 1.0 * C.xxx;\n        //   x2 = x0 - i2  + 2.0 * C.xxx;\n        //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n        vec3 x1 = x0 - i1 + C.xxx;\n        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n        // Permutations\n        i = mod289(i); \n        vec4 p = permute( permute( permute( \n                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n                + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n        // Gradients: 7x7 points over a square, mapped onto an octahedron.\n        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n        float n_ = 0.142857142857; // 1.0/7.0\n        vec3  ns = n_ * D.wyz - D.xzx;\n\n        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n        vec4 x_ = floor(j * ns.z);\n        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n        vec4 x = x_ *ns.x + ns.yyyy;\n        vec4 y = y_ *ns.x + ns.yyyy;\n        vec4 h = 1.0 - abs(x) - abs(y);\n\n        vec4 b0 = vec4( x.xy, y.xy );\n        vec4 b1 = vec4( x.zw, y.zw );\n\n        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n        vec4 s0 = floor(b0)*2.0 + 1.0;\n        vec4 s1 = floor(b1)*2.0 + 1.0;\n        vec4 sh = -step(h, vec4(0.0));\n\n        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n        vec3 p0 = vec3(a0.xy,h.x);\n        vec3 p1 = vec3(a0.zw,h.y);\n        vec3 p2 = vec3(a1.xy,h.z);\n        vec3 p3 = vec3(a1.zw,h.w);\n\n        // Normalize gradients\n        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n        p0 *= norm.x;\n        p1 *= norm.y;\n        p2 *= norm.z;\n        p3 *= norm.w;\n\n        // Mix final noise value\n        vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n        m = m * m;\n        return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );\n    }\n\n    void main() {\n        vUv = uv;\n\n        vec3 pos = position;\n        float noiseFreq = 3.5;\n        float noiseAmp = 0.15; \n        vec3 noisePos = vec3(pos.x * noiseFreq + time, pos.y, pos.z);\n        pos.z += snoise(noisePos) * noiseAmp;\n\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);\n    }\n";
var vertexShader12 = "\n    uniform float time;\n    uniform float amplitude;\n    uniform float frequency;\n\n    attribute vec3 customColor;\n\n    varying vec3 vNormal;\n    varying vec3 vColor;\n\n    void main() {\n        vNormal = normal;\n        vColor = customColor;\n\n        vec3 newPosition = position + vec3(sin(frequency * time), sin(frequency * time), sin(frequency * time)) * amplitude;\n        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );\n    }\n";
var fragmentShader21 = "\n    varying vec3 vColor;\n    varying vec3 vNormal;\n    uniform sampler2D texture1;\n    varying vec2 vUv;\n\n    void main() {\n        const float ambient = 0.4;\n        vec3 light = vec3( 1.0 );\n        light = normalize( light );\n\n        float directional = max( dot( vNormal, light ), 0.0 );\n\n        gl_FragColor = vec4( ( directional + ambient ) * vColor, 1.0 );\n\n        gl_FragColor = texture2D(texture1, vUv);\n    }\n";
var fragmentShader = "\n    // attribute vec3 vColor;\n    uniform sampler2D texture1;\n    varying vec2 vUv;\n    uniform vec4 color;\n\n    void main() {\n        gl_FragColor = texture2D(texture1, vUv) * color;\n    }\n";
export function createFoliageMaterial(texture) {
    // const shader = new ShaderMaterial({
    //     uniforms: {
    //         time: { value: 1 },
    //         amplitude: { value: 0.1 },
    //         frequency: { value: 0.001 },
    //         // diffuse: { value: [texture] },
    //         diffuse: { value: new Color('#ff00ff') },
    //         map: { value: texture },
    //         color: { value: [0.3843, 0.6509, 0.2274, 1.0] },
    //     },
    //     alphaTest: 0.5,
    //     transparent: true,
    //     vertexShader: vertexShader,
    //     fragmentShader: fragmentShader,depthWrite: false,
    //     // wireframe: true,
    // });
    // console.log(ShaderLib.standard.uniforms);
    // (shader as any).map = texture;
    var shader = new MeshStandardMaterial({
        alphaTest: 0.5,
        color: '#62a63a',
        map: texture,
        side: DoubleSide,
    });
    var update = function (deltaTime) { }; // shader.uniforms.time.value += deltaTime * 0.0005;
    return { shader: shader, update: update };
}
// export class FoliageMaterial extends MeshStandardMaterial {
//     public constructor() {
//         super({
//             shad
//         })
//         // this.displacementBias
//     }
// }
