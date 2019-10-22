#define M_PI 3.1415926535897932384626433832795

uniform vec3 uColor;
uniform float uAlpha;
uniform float uLoadProgress;
uniform float uProgress;

varying vec3 vPosition;

void main()
{
    float angle = atan(vPosition.x, vPosition.y);
    float loadProgress = step(abs(angle / M_PI), uLoadProgress);
    float progress = step(1.0 - abs(angle / M_PI), uProgress);

    float alpha = uAlpha;
    alpha -= uAlpha * 0.5 * (1.0 - loadProgress);
    alpha *= progress;

    gl_FragColor = vec4(uColor, alpha);
    // gl_FragColor = vec4(vec3(progress), 1.0);
}
