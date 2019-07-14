uniform sampler2D tTerrain;
uniform float uTerrainSize;

varying vec3 vColor;
varying vec4 vModelPosition;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vModelPosition = modelPosition;

    vec4 terrainColor = texture2D(tTerrain, modelPosition.xz / uTerrainSize + 0.5);
    modelPosition.y += terrainColor.b * 1.0;

    vec3 transformedNormal = normalMatrix * normal;
    vColor = normalize( transformedNormal ) * 0.5 + 0.5;

    gl_Position = projectionMatrix * viewMatrix * modelPosition;
}
