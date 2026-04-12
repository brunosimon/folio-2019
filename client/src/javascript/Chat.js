import { CAR_COLORS } from '../../../shared/constants.js'

export default class Chat
{
    constructor(_options)
    {
        this.network = _options.network

        this.$toggle   = document.getElementById('chat-toggle')
        this.$badge    = document.getElementById('chat-badge')
        this.$panel    = document.getElementById('chat-panel')
        this.$messages = document.getElementById('chat-messages')
        this.$form     = document.getElementById('chat-form')
        this.$input    = document.getElementById('chat-input')

        if(!this.$toggle || !this.$panel) return

        this.open    = false
        this.unread  = 0

        this._setupToggle()
        this._setupForm()
        this._setupNetwork()
        this._setupKeyboard()

        // Show button once game is ready
        this.$toggle.style.display = 'flex'
    }

    _setupToggle()
    {
        this.$toggle.addEventListener('click', (e) =>
        {
            e.stopPropagation()
            this._togglePanel()
        })
    }

    _togglePanel()
    {
        this.open = !this.open
        this.$panel.style.display = this.open ? 'flex' : 'none'

        if(this.open)
        {
            this.unread = 0
            this.$badge.style.display = 'none'
            this.$input.focus()
        }
    }

    _setupForm()
    {
        this.$form.addEventListener('submit', (e) =>
        {
            e.preventDefault()
            const text = this.$input.value.trim()
            if(!text) return

            this.network.sendChat(text)
            this._addMessage(this.network.localPlayerName || 'You', text, null, true)
            this.$input.value = ''
        })

        // Prevent game controls from firing while typing
        this.$input.addEventListener('keydown', (e) => { e.stopPropagation() })
        this.$input.addEventListener('keyup', (e) => { e.stopPropagation() })
    }

    _setupKeyboard()
    {
        // Press Enter to open chat, Escape to close
        document.addEventListener('keydown', (e) =>
        {
            if(e.key === 'Enter' && !this.open)
            {
                // Don't open if lobby is visible
                const lobby = document.getElementById('lobby')
                if(lobby && !lobby.classList.contains('hidden')) return

                e.preventDefault()
                this._togglePanel()
            }
            else if(e.key === 'Escape' && this.open)
            {
                e.preventDefault()
                this._togglePanel()
            }
        })
    }

    _setupNetwork()
    {
        this.network.on('chat:message', ({ name, text, color }) =>
        {
            this._addMessage(name, text, color, false)

            if(!this.open)
            {
                this.unread++
                this.$badge.textContent = this.unread > 9 ? '9+' : this.unread
                this.$badge.style.display = 'flex'
            }
        })
    }

    _addMessage(name, text, colorIdx, isLocal)
    {
        const $msg = document.createElement('div')
        $msg.style.cssText = 'font-size: 11px; line-height: 1.4; word-break: break-word;'

        const color = isLocal
            ? '#aaa'
            : (CAR_COLORS[colorIdx % CAR_COLORS.length] || '#aaa')

        $msg.innerHTML = `<span style="color:${color}; font-weight:bold;">${this._escape(name)}</span> <span style="color:rgba(255,255,255,0.8);">${this._escape(text)}</span>`

        this.$messages.appendChild($msg)

        // Keep max 50 messages
        while(this.$messages.children.length > 50)
            this.$messages.removeChild(this.$messages.firstChild)

        // Auto-scroll
        this.$messages.scrollTop = this.$messages.scrollHeight
    }

    _escape(str)
    {
        const div = document.createElement('div')
        div.textContent = str
        return div.innerHTML
    }
}
