#define M_PI 3.1415926535897932384626433832795

uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform vec2 uStrength;

varying vec2 vUv;

#pragma glslify: blur9 = require(../partials/blur9.glsl)

void main()
{
    vec4 diffuseColor = texture2D(tDiffuse, vUv);
    vec4 blurColor = blur9(tDiffuse, vUv, uResolution, uStrength);
    float blurStrength = 1.0 - sin(vUv.y * M_PI);
    gl_FragColor = mix(diffuseColor, blurColor, blurStrength);
}
