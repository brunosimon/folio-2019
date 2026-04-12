import { CAR_COLORS } from '../../../shared/constants.js'

/**
 * LobbyUI
 * Multi-step pre-game configuration: name → color → car type → join.
 */
export default class LobbyUI
{
    constructor(_options)
    {
        this.network = _options.network
        this.config  = _options.config   // shared Application config — we set cyberTruck on it

        this.$lobby = document.getElementById('lobby')
        this.$hud   = document.getElementById('mp-hud')
        this.$toast = document.getElementById('mp-toast')

        this._toastTimer  = null
        this._onlineCount = 1

        // Load saved config from localStorage, fall back to defaults
        const saved        = this._loadSaved()
        this._name         = saved.name     || ''
        this._colorIdx     = saved.colorIdx ?? 0
        this._carType      = saved.carType  || 'default'
        this._step         = 0

        this._buildColorGrid()
        this._bindLobbyEvents()
        this._restoreSavedUI()
        this._setupNetworkEvents()
    }

    // ─── Persistence ─────────────────────────────────────────────────────────

    _loadSaved()
    {
        try { return JSON.parse(localStorage.getItem('rg:playerConfig') || '{}') }
        catch { return {} }
    }

    _save()
    {
        localStorage.setItem('rg:playerConfig', JSON.stringify({
            name:     this._name,
            colorIdx: this._colorIdx,
            carType:  this._carType,
        }))
    }

    _restoreSavedUI()
    {
        // Name
        if(this._name)
        {
            document.getElementById('lobby-name').value = this._name
        }

        // Color swatch
        this._selectColor(this._colorIdx)

        // Car type
        document.querySelectorAll('.car-option').forEach(el =>
        {
            el.classList.toggle('selected', el.dataset.type === this._carType)
        })
    }

    // ─── Build ───────────────────────────────────────────────────────────────

    _buildColorGrid()
    {
        const grid = document.getElementById('color-grid')
        CAR_COLORS.forEach((hex, i) =>
        {
            const swatch = document.createElement('div')
            swatch.className = 'color-swatch' + (i === 0 ? ' selected' : '')
            swatch.style.background = hex
            swatch.dataset.idx = i
            swatch.addEventListener('click', () => this._selectColor(i))
            grid.appendChild(swatch)
        })
    }

    _selectColor(idx)
    {
        this._colorIdx = idx
        document.querySelectorAll('.color-swatch').forEach((s, i) =>
        {
            s.classList.toggle('selected', i === idx)
        })
    }

    // ─── Step navigation ─────────────────────────────────────────────────────

    _bindLobbyEvents()
    {
        const nameInput = document.getElementById('lobby-name')
        const btnNameNext  = document.getElementById('btn-name-next')
        const btnColorBack = document.getElementById('btn-color-back')
        const btnColorNext = document.getElementById('btn-color-next')
        const btnCarBack   = document.getElementById('btn-car-back')
        const btnPlay      = document.getElementById('btn-play')

        // Allow Enter key on name field
        nameInput.addEventListener('keydown', (e) =>
        {
            if(e.key === 'Enter') btnNameNext.click()
        })

        btnNameNext.addEventListener('click', () =>
        {
            const val = nameInput.value.trim()
            if(!val) { nameInput.focus(); return }
            this._name = val
            this._goToStep(1)
        })

        btnColorBack.addEventListener('click', () => this._goToStep(0))
        btnColorNext.addEventListener('click', () => this._goToStep(2))

        btnCarBack.addEventListener('click', () => this._goToStep(1))

        document.querySelectorAll('.car-option').forEach(el =>
        {
            el.addEventListener('click', () =>
            {
                document.querySelectorAll('.car-option').forEach(o => o.classList.remove('selected'))
                el.classList.add('selected')
                this._carType = el.dataset.type
            })
        })

        btnPlay.addEventListener('click', () => this._submit())

        // Focus name input immediately
        nameInput.focus()
    }

    _goToStep(n)
    {
        document.getElementById(`step-${this._step}`).classList.remove('active')
        this._step = n
        document.getElementById(`step-${n}`).classList.add('active')

        // Update dots
        document.querySelectorAll('.lobby-dot').forEach((d, i) =>
        {
            d.classList.toggle('active', i === n)
        })

        // Update label
        document.getElementById('lobby-step-label').textContent = `Step ${n + 1} of 3`

        // Focus name input when going back to step 0
        if(n === 0) document.getElementById('lobby-name').focus()
    }

    _submit()
    {
        // Persist selections for next session
        this._save()

        // Apply selections to shared config before world.start() is called
        this.config.cyberTruck = (this._carType === 'cybertruck')
        this.config.carColor   = this._colorIdx

        // Hide lobby
        this.$lobby.classList.add('hidden')

        // Join the room — send name, color and car type so other players see the right car
        this.network.join(this._name, this._colorIdx, this._carType)
    }

    // ─── Network events ───────────────────────────────────────────────────────

    _setupNetworkEvents()
    {
        this.network.on('disconnected', () =>
        {
            this.showToast('Connection lost — reconnecting...')
        })

        this.network.on('room:joined', ({ existingPlayers }) =>
        {
            this._onlineCount = existingPlayers.length + 1
            this.$hud.style.display = 'block'
            this._updateHUD()
        })

        this.network.on('room:full', () =>
        {
            // Show lobby again so user can try later
            this.$lobby.classList.remove('hidden')
            this.showToast('Room is full — try again later')
        })

        this.network.on('player:joined', ({ name }) =>
        {
            this._onlineCount++
            this._updateHUD()
            this.showToast(`${name} joined`)
        })

        this.network.on('player:left', () =>
        {
            this._onlineCount = Math.max(1, this._onlineCount - 1)
            this._updateHUD()
        })
    }

    _updateHUD()
    {
        this.$hud.textContent = `${this._onlineCount} online`
    }

    showToast(message, duration = 3000)
    {
        clearTimeout(this._toastTimer)
        this.$toast.textContent   = message
        this.$toast.style.display = 'block'
        this._toastTimer = setTimeout(() =>
        {
            this.$toast.style.display = 'none'
        }, duration)
    }
}
