#define TOTO
#define PHONG

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

    varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

// Custom start
uniform mat3 uvTransform;
uniform sampler2D tTerrain;
uniform float uTerrainSize;

attribute vec4 tangent;

varying vec3 vWorldPosition;
varying vec3 vObjectNormal;
varying vec3 vObjectTangent;
varying vec2 vUv;
varying float vDepth;
// Custom end

void main()
{
    #include <uv_vertex>
    #include <uv2_vertex>
    #include <color_vertex>

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>

#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

    vNormal = normalize( transformedNormal );

#endif

    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>

    // Custom start

    vec4 modelPosition = modelMatrix * vec4( transformed, 1.0 );

    vec4 terrainColor = texture2D(tTerrain, modelPosition.xz / uTerrainSize + 0.5);
    modelPosition.y += terrainColor.b * 1.0;

    vec4 mvPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * mvPosition;

    // Custom end

    // #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>

    vViewPosition = - mvPosition.xyz;

    // Custom start
    vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );
    vWorldPosition = worldPosition.xyz;

    vObjectNormal = objectNormal;
    vObjectTangent = tangent.xyz;
    vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
    vDepth = gl_Position.w;
    // Custom end

    // #include <worldpos_vertex>
    #include <envmap_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
}
