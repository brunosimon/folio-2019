import * as THREE from 'three'

import imageSource from './petal.jpg'
import Material from './Material.js'

export default class Petal
{
    constructor(_options)
    {
        this.containerPosition = _options.containerPosition

        // Geometry
        this.geometry = new THREE.PlaneGeometry(1, 1, 8, 4)
        this.geometry.rotateX(Math.PI * 0.5)

        for(const _vertice of this.geometry.vertices)
        {
            const distance = Math.sqrt(Math.pow(_vertice.x, 2) + Math.pow(_vertice.z, 2))
            _vertice.y = Math.cos(_vertice.x * 3) * 0.15 + Math.cos(Math.PI + distance * 8) * 0.05 + 2
        }
        this.geometry.scale(1, 1, 0.5)

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
        mesh.scale.set(0.06, 0.06, 0.06)

        return mesh
    }
}
