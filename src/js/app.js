import * as PIXI from 'pixi.js';
import { Sprite, Texture } from 'pixi.js';

//global variables
let app;
let bgBoxes = document.querySelectorAll('.change-bg .box');

//background texture
const bgTextures = [Texture.from('/images/background-1.avif'), Texture.from('/images/background-2.avif'), Texture.from('/images/background-3.avif')]
const background = new Sprite(bgTextures[0]);
background.width = window.innerWidth;
background.height = window.innerHeight;

//load PIXI
window.onload = ()=>{
  app = new PIXI.Application({
    width: window.innerWidth,
    height:window.innerHeight,
    background: 0x000000,
    backgroundAlpha: 0,
    resizeTo: window,
    view: document.querySelector('.canvas'),
  })

  app.stage.addChild(background);

  changeBgTexture();
}

function changeBgTexture(){
  bgBoxes.forEach((box,index)=>{
    box.addEventListener('click', function(){
      background.texture = bgTextures[index];
    })
  })
}
