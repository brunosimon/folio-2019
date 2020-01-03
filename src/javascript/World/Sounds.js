import { Howl, Howler } from 'howler'

import revealSound from '../../sounds/reveal/reveal-1.mp3'

import engineSound from '../../sounds/engines/1/low_off.mp3'

import brick1Sound from '../../sounds/bricks/brick-1.mp3'
import brick2Sound from '../../sounds/bricks/brick-2.mp3'
// import brick3Sound from '../../sounds/bricks/brick-3.mp3'
import brick4Sound from '../../sounds/bricks/brick-4.mp3'
// import brick5Sound from '../../sounds/bricks/brick-5.mp3'
import brick6Sound from '../../sounds/bricks/brick-6.mp3'
import brick7Sound from '../../sounds/bricks/brick-7.mp3'
import brick8Sound from '../../sounds/bricks/brick-8.mp3'

import bowlingPin1Sound from '../../sounds/bowling/pin-1.mp3'

import carHit1Sound from '../../sounds/car-hits/car-hit-1.mp3'
// import carHit2Sound from '../../sounds/car-hits/car-hit-2.mp3'
import carHit3Sound from '../../sounds/car-hits/car-hit-3.mp3'
import carHit4Sound from '../../sounds/car-hits/car-hit-4.mp3'
import carHit5Sound from '../../sounds/car-hits/car-hit-5.mp3'

import woodHit1Sound from '../../sounds/wood-hits/wood-hit-1.mp3'

import screech1Sound from '../../sounds/screeches/screech-1.mp3'

import uiArea1Sound from '../../sounds/ui/area-1.mp3'

import carHorn1Sound from '../../sounds/car-horns/car-horn-1.mp3'
import carHorn2Sound from '../../sounds/car-horns/car-horn-2.mp3'

import horn1Sound from '../../sounds/horns/horn-1.mp3'
import horn2Sound from '../../sounds/horns/horn-2.mp3'
import horn3Sound from '../../sounds/horns/horn-3.mp3'

export default class Sounds
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.debug = _options.debug

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('sounds')
            // this.debugFolder.open()
        }

        // Set up
        this.items = []

        this.setSettings()
        this.setMasterVolume()
        this.setMute()
        this.setEngine()
    }

    setSettings()
    {
        this.settings = [
            {
                name: 'reveal',
                sounds: [revealSound],
                minDelta: 100,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 1,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'brick',
                sounds: [brick1Sound, brick2Sound, brick4Sound, brick6Sound, brick7Sound, brick8Sound],
                minDelta: 100,
                velocityMin: 1,
                velocityMultiplier: 0.75,
                volumeMin: 0.2,
                volumeMax: 0.85,
                rateMin: 0.5,
                rateMax: 0.75
            },
            {
                name: 'bowlingPin',
                sounds: [bowlingPin1Sound],
                minDelta: 0,
                velocityMin: 1,
                velocityMultiplier: 0.5,
                volumeMin: 0.35,
                volumeMax: 1,
                rateMin: 0.1,
                rateMax: 0.85
            },
            {
                name: 'bowlingBall',
                sounds: [bowlingPin1Sound, bowlingPin1Sound, bowlingPin1Sound],
                minDelta: 0,
                velocityMin: 1,
                velocityMultiplier: 0.5,
                volumeMin: 0.35,
                volumeMax: 1,
                rateMin: 0.1,
                rateMax: 0.2
            },
            {
                name: 'carHit',
                sounds: [carHit1Sound, carHit3Sound, carHit4Sound, carHit5Sound],
                minDelta: 100,
                velocityMin: 2,
                velocityMultiplier: 1,
                volumeMin: 0.2,
                volumeMax: 0.6,
                rateMin: 0.35,
                rateMax: 0.55
            },
            {
                name: 'woodHit',
                sounds: [woodHit1Sound],
                minDelta: 30,
                velocityMin: 1,
                velocityMultiplier: 1,
                volumeMin: 0.5,
                volumeMax: 1,
                rateMin: 0.75,
                rateMax: 1.5
            },
            {
                name: 'screech',
                sounds: [screech1Sound],
                minDelta: 1000,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 0.75,
                volumeMax: 1,
                rateMin: 0.9,
                rateMax: 1.1
            },
            {
                name: 'uiArea',
                sounds: [uiArea1Sound],
                minDelta: 100,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 0.75,
                volumeMax: 1,
                rateMin: 0.95,
                rateMax: 1.05
            },
            {
                name: 'carHorn1',
                sounds: [carHorn1Sound],
                minDelta: 0,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 0.95,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'carHorn2',
                sounds: [carHorn2Sound],
                minDelta: 0,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 0.95,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'horn',
                sounds: [horn1Sound, horn2Sound, horn3Sound],
                minDelta: 100,
                velocityMin: 1,
                velocityMultiplier: 0.75,
                volumeMin: 0.5,
                volumeMax: 1,
                rateMin: 0.75,
                rateMax: 1
            }
        ]

        for(const _settings of this.settings)
        {
            this.add(_settings)
        }
    }

    setMasterVolume()
    {
        // Set up
        this.masterVolume = 0.5
        Howler.volume(this.masterVolume)

        window.requestAnimationFrame(() =>
        {
            Howler.volume(this.masterVolume)
        })

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'masterVolume').step(0.001).min(0).max(1).onChange(() =>
            {
                Howler.volume(this.masterVolume)
            })
        }
    }

    setMute()
    {
        // Set up
        this.muted = typeof this.debug !== 'undefined'
        Howler.mute(this.muted)

        // M Key
        window.addEventListener('keydown', (_event) =>
        {
            if(_event.key === 'm')
            {
                this.muted = !this.muted
                Howler.mute(this.muted)
            }
        })

        // Tab focus / blur
        document.addEventListener('visibilitychange', () =>
        {
            if(document.hidden)
            {
                Howler.mute(true)
            }
            else
            {
                Howler.mute(this.muted)
            }
        })

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'muted').listen().onChange(() =>
            {
                Howler.mute(this.muted)
            })
        }
    }

    setEngine()
    {
        // Set up
        this.engine = {}

        this.engine.progress = 0
        this.engine.progressEasingUp = 0.3
        this.engine.progressEasingDown = 0.15

        this.engine.speed = 0
        this.engine.speedMultiplier = 2.5
        this.engine.acceleration = 0
        this.engine.accelerationMultiplier = 0.4

        this.engine.rate = {}
        this.engine.rate.min = 0.4
        this.engine.rate.max = 1.4

        this.engine.volume = {}
        this.engine.volume.min = 0.4
        this.engine.volume.max = 1
        this.engine.volume.master = 0

        this.engine.sound = new Howl({
            src: [engineSound],
            loop: true
        })

        this.engine.sound.play()

        // Time tick
        this.time.on('tick', () =>
        {
            let progress = Math.abs(this.engine.speed) * this.engine.speedMultiplier + Math.max(this.engine.acceleration, 0) * this.engine.accelerationMultiplier
            progress = Math.min(Math.max(progress, 0), 1)

            this.engine.progress += (progress - this.engine.progress) * this.engine[progress > this.engine.progress ? 'progressEasingUp' : 'progressEasingDown']

            // Rate
            const rateAmplitude = this.engine.rate.max - this.engine.rate.min
            this.engine.sound.rate(this.engine.rate.min + rateAmplitude * this.engine.progress)

            // Volume
            const volumeAmplitude = this.engine.volume.max - this.engine.volume.min
            this.engine.sound.volume((this.engine.volume.min + volumeAmplitude * this.engine.progress) * this.engine.volume.master)
        })

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('engine')
            folder.open()

            folder.add(this.engine, 'progressEasingUp').step(0.001).min(0).max(1).name('progressEasingUp')
            folder.add(this.engine, 'progressEasingDown').step(0.001).min(0).max(1).name('progressEasingDown')
            folder.add(this.engine.rate, 'min').step(0.001).min(0).max(4).name('rateMin')
            folder.add(this.engine.rate, 'max').step(0.001).min(0).max(4).name('rateMax')
            folder.add(this.engine, 'speedMultiplier').step(0.01).min(0).max(5).name('speedMultiplier')
            folder.add(this.engine, 'accelerationMultiplier').step(0.01).min(0).max(100).name('accelerationMultiplier')
            folder.add(this.engine, 'progress').step(0.01).min(0).max(1).name('progress').listen()
        }
    }

    add(_options)
    {
        const item = {
            name: _options.name,
            minDelta: _options.minDelta,
            velocityMin: _options.velocityMin,
            velocityMultiplier: _options.velocityMultiplier,
            volumeMin: _options.volumeMin,
            volumeMax: _options.volumeMax,
            rateMin: _options.rateMin,
            rateMax: _options.rateMax,
            lastTime: 0,
            sounds: []
        }

        for(const _sound of _options.sounds)
        {
            const sound = new Howl({ src: [_sound] })

            item.sounds.push(sound)
        }

        this.items.push(item)
    }

    play(_name, _velocity)
    {
        const item = this.items.find((_item) => _item.name === _name)
        const time = Date.now()
        const velocity = typeof _velocity === 'undefined' ? 0 : _velocity

        if(item && time > item.lastTime + item.minDelta && (item.velocityMin === 0 || velocity > item.velocityMin))
        {
            // Find random sound
            const sound = item.sounds[Math.floor(Math.random() * item.sounds.length)]

            // Update volume
            let volume = Math.min(Math.max((velocity - item.velocityMin) * item.velocityMultiplier, item.volumeMin), item.volumeMax)
            volume = Math.pow(volume, 2)
            sound.volume(volume)

            // Update rate
            const rateAmplitude = item.rateMax - item.rateMin
            sound.rate(item.rateMin + Math.random() * rateAmplitude)

            // Play
            sound.play()

            // Save last play time
            item.lastTime = time
        }
    }
}
