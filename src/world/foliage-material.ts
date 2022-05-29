import { ImageUtils, IntType, MeshStandardMaterial, ShaderMaterial, Texture, ShaderLib, Color, DoubleSide } from 'three';

const vertexShader = `
    varying vec2 vUv;
    uniform float time;

    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
    }
    
    vec4 taylorInvSqrt(vec4 r)
    {
        return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    float snoise(vec3 v)
    { 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        //   x0 = x0 - 0.0 + 0.0 * C.xxx;
        //   x1 = x0 - i1  + 1.0 * C.xxx;
        //   x2 = x0 - i2  + 2.0 * C.xxx;
        //   x3 = x0 - 1.0 + 3.0 * C.xxx;
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

        // Permutations
        i = mod289(i); 
        vec4 p = permute( permute( permute( 
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        // Normalize gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        // Mix final noise value
        vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
        vUv = uv;

        vec3 pos = position;
        float noiseFreq = 3.5;
        float noiseAmp = 0.15; 
        vec3 noisePos = vec3(pos.x * noiseFreq + time, pos.y, pos.z);
        pos.z += snoise(noisePos) * noiseAmp;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }
`;

const vertexShader12 = `
    uniform float time;
    uniform float amplitude;
    uniform float frequency;

    attribute vec3 customColor;

    varying vec3 vNormal;
    varying vec3 vColor;

    void main() {
        vNormal = normal;
        vColor = customColor;

        vec3 newPosition = position + vec3(sin(frequency * time), sin(frequency * time), sin(frequency * time)) * amplitude;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    }
`;

const fragmentShader21 = `
    varying vec3 vColor;
    varying vec3 vNormal;
    uniform sampler2D texture1;
    varying vec2 vUv;

    void main() {
        const float ambient = 0.4;
        vec3 light = vec3( 1.0 );
        light = normalize( light );

        float directional = max( dot( vNormal, light ), 0.0 );

        gl_FragColor = vec4( ( directional + ambient ) * vColor, 1.0 );

        gl_FragColor = texture2D(texture1, vUv);
    }
`;

const fragmentShader = `
    // attribute vec3 vColor;
    uniform sampler2D texture1;
    varying vec2 vUv;
    uniform vec4 color;

    void main() {
        gl_FragColor = texture2D(texture1, vUv) * color;
    }
`;

export function createFoliageMaterial(texture: Texture) {
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

    const shader = new MeshStandardMaterial({
        alphaTest: 0.5,
        color: '#62a63a',
        map: texture,
        side: DoubleSide,
    });
    const update = (deltaTime: number) => {}; // shader.uniforms.time.value += deltaTime * 0.0005;

    return { shader, update };
}

// export class FoliageMaterial extends MeshStandardMaterial {
//     public constructor() {
//         super({
//             shad
//         })
//         // this.displacementBias
//     }


// }
