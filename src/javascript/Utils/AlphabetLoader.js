import * as THREE from 'three'

/**
 * AlphabetLoader - Loads individual letters from a master alphabet GLB file
 * Uses Three.js to extract and clone specific letter nodes
 */
export default class AlphabetLoader
{
    constructor(_alphabetScene)
    {
        this.alphabetScene = _alphabetScene
        this.letters = {}
        this.extractLetters()
    }

    extractLetters()
    {
        if (!this.alphabetScene || !this.alphabetScene.children)
        {
            console.warn('AlphabetLoader: No scene provided or scene has no children')
            return
        }

        const LETTER_MAP = {
            0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F',
            6: 'G', 7: 'H', 8: 'I', 9: 'J', 10: 'K', 11: 'L',
            12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q', 17: 'R',
            18: 'S', 19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X',
            24: 'Y', 25: 'Z'
        }

        // Extract each letter node from the master scene
        this.alphabetScene.children.forEach((child, index) =>
        {
            const letterName = LETTER_MAP[index] || `LETTER${index}`
            
            // Clone the node (deep clone to include all geometry/materials)
            const clonedNode = child.clone(true)
            
            // Store both the node and a scene containing it
            this.letters[letterName.toLowerCase()] = {
                node: clonedNode,
                scene: (() =>
                {
                    const scene = new THREE.Scene()
                    scene.add(clonedNode.clone(true))
                    return scene
                })()
            }
        })

        console.log(`AlphabetLoader: Extracted ${Object.keys(this.letters).length} letters`)
    }

    getLetter(_letterName)
    {
        const letter = _letterName.toLowerCase()
        if (this.letters[letter])
        {
            // Return a fresh clone of the letter
            return this.letters[letter].node.clone(true)
        }
        console.warn(`AlphabetLoader: Letter '${_letterName}' not found`)
        return null
    }

    getLetterScene(_letterName)
    {
        const letter = _letterName.toLowerCase()
        if (this.letters[letter])
        {
            return this.letters[letter].scene
        }
        console.warn(`AlphabetLoader: Letter '${_letterName}' scene not found`)
        return null
    }
}
