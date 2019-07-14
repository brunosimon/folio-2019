import Application from './Application.js'

window.application = new Application({
    $canvas: document.querySelector('.js-canvas'),
    useComposer: true
})

if(module.hot)
{
    module.hot.dispose(() =>
    {
        window.application.destructor()
        window.application = null
    })
}