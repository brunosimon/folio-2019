import './style/main.css'
import Application from './javascript/Application.js'
import io from 'socket.io-client'

const socket = io();

socket.on('connect', ()=>{});

window.application = new Application({
    $canvas: document.querySelector('.js-canvas'),
    useComposer: true
})



