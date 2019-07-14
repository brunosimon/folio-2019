import * as THREE from 'three'

import imageSource from './dandelion.jpg'
import Material from './Material.js'

export default class Dandelion
{
    constructor(_options)
    {
        this.containerPosition = _options.containerPosition

        // Geometry
        this.geometry = new THREE.PlaneGeometry(1, 1, 1, 8)
        this.geometry.rotateX(Math.PI * 0.5)

        for(const _vertice of this.geometry.vertices)
        {
            _vertice.y = - Math.cos(_vertice.z * 3) * 0.1
        }
        this.geometry.scale(0.8, 1, 1)

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
        this.material.uniforms.uAlpha.value = 0.7
    }

    getMesh()
    {
        const mesh = new THREE.Mesh(this.geometry, this.material)
        mesh.scale.set(0.15, 0.15, 0.15)

        return mesh
    }
}
