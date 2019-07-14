import * as THREE from 'three'

import imageSource from './ribbon.jpg'
import Material from './Material.js'

export default class Ribbon
{
    constructor(_options)
    {
        this.containerPosition = _options.containerPosition

        // Geometry
        this.geometry = new THREE.PlaneGeometry(1, 1, 4, 8)
        this.geometry.rotateX(Math.PI * 0.5)

        for(const _vertice of this.geometry.vertices)
        {
            const originalVertice = _vertice.clone()

            _vertice.y = Math.sin(originalVertice.z * 0.2) * originalVertice.x - Math.cos(originalVertice.z * 2) * 0.2
            _vertice.x = Math.cos(originalVertice.z * 0.2) * originalVertice.x
        }
        this.geometry.scale(0.2, 1, 1)

        this.geometry = new THREE.BufferGeometry().fromGeometry(this.geometry)

        // Texture
        const image = new Image()
        this.texture = new THREE.Texture(image)

        image.addEventListener('load', () =>
        {
            this.texture.needsUpdate = true
        })
        image.src = imageSource

        // Material
        // this.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false, transparent: true, alphaMap: this.texture, side: THREE.DoubleSide })
        this.material = new Material()
        this.material.uniforms.uTexture.value = this.texture
        this.material.uniforms.uContainerPosition.value = this.containerPosition
        this.material.uniforms.uAlpha.value = 1
    }

    getMesh()
    {
        const mesh = new THREE.Mesh(this.geometry, this.material)
        mesh.scale.set(0.08, 0.08, 0.08)

        return mesh
    }
}
