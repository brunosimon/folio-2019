varying vec3 vPosition;
varying vec3 vModelPosition;
varying vec2 vUv;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vPosition = position.xyz;
    vModelPosition = modelPosition.xyz;
    vUv = uv;
}
