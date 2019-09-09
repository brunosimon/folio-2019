uniform float uTime;
uniform float uBorderAlpha;
uniform float uStrikeAlpha;

varying vec3 vPosition;
varying vec3 vModelPosition;
varying vec2 vUv;

void main()
{
    float uStrikeWidth = 0.5;
    // float uStrikeAlpha = 0.25;
    float uBorderWidth = 0.1;
    // float uBorderAlpha = 0.5;

    if(vModelPosition.z < 0.0)
    {
        discard;
    }

    float strikeStrength = mod((vPosition.x + vPosition.y - uTime * 0.00035 + vPosition.z) / uStrikeWidth * 0.5, 1.0);
    strikeStrength = step(strikeStrength, 0.5) * uStrikeAlpha;

    float borderStrength = max(step(1.0 - vUv.y, uBorderWidth), step(vUv.y, uBorderWidth)) * uBorderAlpha;

    float alpha = max(strikeStrength, borderStrength);

    gl_FragColor = vec4(vec3(1.0), alpha);

    // gl_FragColor = vec4(vUv, 1.0, 1.0);
}
