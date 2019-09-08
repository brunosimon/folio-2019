import EventEmitter from '../Utils/EventEmitter.js'

export default class Area extends EventEmitter
{
    constructor(_options)
    {
        super()

        console.log('_options', _options)
    }
}
