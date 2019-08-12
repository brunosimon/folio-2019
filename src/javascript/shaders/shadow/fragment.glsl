#define PI 3.141592653589793

uniform vec3 uColor;
uniform float uAlpha;
uniform float uRadius;

varying vec2 vUv;

float sineInOut(float t)
{
    return - 0.5 * (cos(PI * t) - 1.0);
}

void main()
{
    float strength = 0.0;

    if(vUv.x < uRadius && vUv.y < uRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(uRadius)) / uRadius, 0.0, 1.0);
    }

    else if(vUv.x > 1.0 - uRadius && vUv.y < uRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(1.0 - uRadius, uRadius)) / uRadius, 0.0, 1.0);
    }

    else if(vUv.x > 1.0 - uRadius && vUv.y > 1.0 - uRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(1.0 - uRadius, 1.0 - uRadius)) / uRadius, 0.0, 1.0);
    }

    else if(vUv.x < uRadius && vUv.y > 1.0 - uRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(uRadius, 1.0 - uRadius)) / uRadius, 0.0, 1.0);
    }

    else
    {
        float xNeg = clamp(vUv.x / uRadius, 0.0, 1.0);
        float xPos = clamp((1.0 - vUv.x) / uRadius, 0.0, 1.0);
        float yNeg = clamp(vUv.y / uRadius, 0.0, 1.0);
        float yPos = clamp((1.0 - vUv.y) / uRadius, 0.0, 1.0);

        strength = xNeg * xPos * yNeg * yPos;
    }

    strength = sineInOut(strength);
    strength *= uAlpha;

    gl_FragColor = vec4(uColor, strength);
}
