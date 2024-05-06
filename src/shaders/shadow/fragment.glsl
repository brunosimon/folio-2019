#define PI 3.141592653589793

uniform vec3 uColor;
uniform float uAlpha;
uniform float uFadeRadius;

varying vec2 vUv;

float sineInOut(float t)
{
    return - 0.5 * (cos(PI * t) - 1.0);
}

void main()
{
    float strength = 0.0;

    if(vUv.x < uFadeRadius && vUv.y < uFadeRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(uFadeRadius)) / uFadeRadius, 0.0, 1.0);
    }

    else if(vUv.x > 1.0 - uFadeRadius && vUv.y < uFadeRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(1.0 - uFadeRadius, uFadeRadius)) / uFadeRadius, 0.0, 1.0);
    }

    else if(vUv.x > 1.0 - uFadeRadius && vUv.y > 1.0 - uFadeRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(1.0 - uFadeRadius, 1.0 - uFadeRadius)) / uFadeRadius, 0.0, 1.0);
    }

    else if(vUv.x < uFadeRadius && vUv.y > 1.0 - uFadeRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(uFadeRadius, 1.0 - uFadeRadius)) / uFadeRadius, 0.0, 1.0);
    }

    else
    {
        float xNeg = clamp(vUv.x / uFadeRadius, 0.0, 1.0);
        float xPos = clamp((1.0 - vUv.x) / uFadeRadius, 0.0, 1.0);
        float yNeg = clamp(vUv.y / uFadeRadius, 0.0, 1.0);
        float yPos = clamp((1.0 - vUv.y) / uFadeRadius, 0.0, 1.0);

        strength = xNeg * xPos * yNeg * yPos;
    }

    strength = sineInOut(strength);
    strength *= uAlpha;

    gl_FragColor = vec4(uColor, strength);
	#include <colorspace_fragment>
}
