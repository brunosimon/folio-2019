import gsap from 'gsap'

export default class ThreejsJourney
{
    constructor(_options)
    {
        // Options
        this.config = _options.config
        this.time = _options.time
        this.world = _options.world

        // Setup
        this.$container = document.querySelector('.js-threejs-journey')
        this.$messages = [...this.$container.querySelectorAll('.js-message')]
        this.$yes = this.$container.querySelector('.js-yes')
        this.$no = this.$container.querySelector('.js-no')
        this.step = 0
        this.maxStep = this.$messages.length - 1
        this.seenCount = window.localStorage.getItem('threejsJourneySeenCount') || 0
        this.seenCount = parseInt(this.seenCount)
        this.shown = false
        this.traveledDistance = 0
        this.minTraveledDistance = (this.config.debug ? 5 : 75) * (this.seenCount + 1)
        this.prevent = !!window.localStorage.getItem('threejsJourneyPrevent')

        if(this.config.debug)
            this.start()
        
        if(this.prevent)
            return

        this.setYesNo()
        this.setLog()

        this.time.on('tick', () =>
        {
            if(this.world.physics)
            {
                this.traveledDistance += this.world.physics.car.forwardSpeed

                if(!this.config.touch && !this.shown && this.traveledDistance > this.minTraveledDistance)
                {
                    this.start()
                }
            }
        })
    }

    setYesNo()
    {
        // Clicks
        this.$yes.addEventListener('click', () =>
        {
            gsap.delayedCall(2, () =>
            {
                this.hide()
            })
            window.localStorage.setItem('threejsJourneyPrevent', 1)
        })

        this.$no.addEventListener('click', () =>
        {
            this.next()

            gsap.delayedCall(5, () =>
            {
                this.hide()
            })
        })

        // Hovers
        this.$yes.addEventListener('mouseenter', () =>
        {
            this.$container.classList.remove('is-hover-none')
            this.$container.classList.remove('is-hover-no')
            this.$container.classList.add('is-hover-yes')
        })

        this.$no.addEventListener('mouseenter', () =>
        {
            this.$container.classList.remove('is-hover-none')
            this.$container.classList.add('is-hover-no')
            this.$container.classList.remove('is-hover-yes')
        })

        this.$yes.addEventListener('mouseleave', () =>
        {
            this.$container.classList.add('is-hover-none')
            this.$container.classList.remove('is-hover-no')
            this.$container.classList.remove('is-hover-yes')
        })

        this.$no.addEventListener('mouseleave', () =>
        {
            this.$container.classList.add('is-hover-none')
            this.$container.classList.remove('is-hover-no')
            this.$container.classList.remove('is-hover-yes')
        })
    }

    setLog()
    {
//         console.log(
//             `%c 
// ▶
// ▶▶▶▶
// ▶▶▶▶▶▶▶
// ▶▶▶▶▶▶▶▶▶▶
// ▶▶▶▶▶▶▶▶     ▶
// ▶▶▶▶      ▶▶▶▶▶▶▶▶
// ▶     ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶
//    ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶
//       ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶      
// ▶▶        ▶▶▶▶▶▶▶▶▶▶     ▶   ▶▶▶
// ▶▶▶▶▶▶        ▶      ▶▶▶▶▶   ▶▶▶▶▶▶
// ▶▶▶▶▶▶▶▶▶▶▶       ▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶
// ▶▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶
// ▶▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶
// ▶▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶   ▶
//  ▶▶▶▶▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶▶▶▶
//      ▶▶▶▶▶▶▶▶   ▶▶▶▶▶▶▶
// ▶▶▶▶     ▶▶▶▶   ▶▶▶
// ▶▶▶▶▶▶▶     ▶   
// ▶▶▶▶▶▶▶▶▶▶
// ▶▶▶▶▶▶▶
// ▶▶
//             `,
//             'color: #705df2;'
//         )
        console.log('%cWhat are you doing here?! you sneaky developer...', 'color: #32ffce');
        console.log('%cDo you want to learn how this portfolio has been made?', 'color: #32ffce');
        console.log('%cCheckout Three.js Journey 👉 https://threejs-journey.com?c=p2', 'color: #32ffce');
        console.log('%c— Bruno', 'color: #777777');
    }

    hide()
    {
        for(const _$message of this.$messages)
        {
            _$message.classList.remove('is-visible')
        }

        gsap.delayedCall(0.5, () =>
        {
            this.$container.classList.remove('is-active')
        })
    }

    start()
    {
        this.$container.classList.add('is-active')

        window.requestAnimationFrame(() =>
        {
            this.next()

            gsap.delayedCall(4, () =>
            {
                this.next()
            })
            gsap.delayedCall(7, () =>
            {
                this.next()
            })
        })

        this.shown = true
        
        window.localStorage.setItem('threejsJourneySeenCount', this.seenCount + 1)
    }

    updateMessages()
    {
        let i = 0

        // Visibility
        for(const _$message of this.$messages)
        {
            if(i < this.step)
                _$message.classList.add('is-visible')

            i++
        }

        // Position
        this.$messages.reverse()

        let height = 0
        i = this.maxStep
        for(const _$message of this.$messages)
        {
            const messageHeight = _$message.offsetHeight
            if(i < this.step)
            {
                _$message.style.transform = `translateY(${- height}px)`
                height += messageHeight + 20
            }
            else
            {
                _$message.style.transform = `translateY(${messageHeight}px)`
            }

            i--
        }


        this.$messages.reverse()
    }

    next()
    {
        if(this.step > this.maxStep)
            return

        this.step++

        this.updateMessages()
    }
}