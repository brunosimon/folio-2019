#define M_PI 3.1415926535897932384626433832795

uniform sampler2D tDiffuse;
uniform vec2 uResolution;

varying vec2 vUv;

#pragma glslify: blur13 = require(../partials/blur13.glsl)

void main()
{
    // Base
    vec4 diffuseColor = texture2D(tDiffuse, vUv);

    // Final
    // gl_FragColor = diffuseColor;
    vec4 hBlur = blur13(tDiffuse, vUv, uResolution, vec2(2.0, 0.0));
    vec4 vBlur = blur13(tDiffuse, vUv, uResolution, vec2(0.0, 2.0));
    float blurStrength = 1.0 - sin(vUv.y * M_PI);
    vec4 blurColor = hBlur * 0.5 + vBlur * 0.5;
    gl_FragColor = mix(diffuseColor, blurColor, blurStrength);
}
