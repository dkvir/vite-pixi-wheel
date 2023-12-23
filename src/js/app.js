import * as PIXI from 'pixi.js';
import { gsap } from "gsap";
import { Sprite, Texture } from 'pixi.js';

//global variables
let bgBoxes = document.querySelectorAll('.change-bg .box');
const wheelSectors = [
  {
    text: "2M",
    prize: "2M",
    color: 0xf9b807,
  },
  {
    icon: "/images/icons/iron.png",
    prize: "Iron",
    color: 0x25d22,
  },
  {
    text: "3M",
    prize: "3M",
    color: 0xe54746,
  },
  {
    icon: "/images/icons/sedan.png",
    prize: "Car",
    color: 0x269271,
  },
  {
    text: "1M",
    prize: "1M",
    color: 0x376fa3,
  },
  {
    icon: "/images/icons/home.png",
    prize: "Home",
    color: 0x9a1c4b,
  },
  {
    text: "5M",
    prize: "5M",
    color: 0xd6d4c6,
  },
  {
    icon: "/images/icons/motorcycle.png",
    prize: "Bike",
    color: 0x676854,
  },
]
const sectorCount = wheelSectors.length;
let animating = false;

//load PIXI
let app = new PIXI.Application({
  width: window.innerWidth,
  height:window.innerHeight,
  resizeTo: window,
  background: 0x000000,
  backgroundAlpha: 0,
  view: document.querySelector('.canvas'),
})

app.renderer.view.style.position = 'absolute'

// change background textures
changeBgTexture();


//background texture
const bgTextures = [Texture.from('/images/background-1.avif'), Texture.from('/images/background-2.avif'), Texture.from('/images/background-3.avif')]
const background = new Sprite(bgTextures[0]);
background.width = window.innerWidth;
background.height = window.innerHeight;
app.stage.addChild(background);


//wheel container
const wheel = new PIXI.Container();
const circleDeg =  Math.PI * 2;
const oneSector = circleDeg / sectorCount;
let radius = window.innerWidth / 6;
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2 - radius / 3;
wheel.position.set(centerX, centerY);
app.stage.addChild(wheel);

//sector container
const sectorContainer = new PIXI.Container();

// wheel graphics
const wheelGraphicsBg = new PIXI.Graphics();
wheelGraphicsBg.beginFill(0x1f2f32).arc(0, 0, radius, 0, 360);
wheel.addChild(wheelGraphicsBg);

wheelSectors.forEach((item, i)=>{
  const startAngle = (i * circleDeg) / sectorCount - 5 * (oneSector /2);
  const endAngle = ((i + 1) * circleDeg) / sectorCount - 5 * (oneSector /2);

  // Create sector
  const sector = createSector(startAngle, endAngle, item);
  wheel.addChild(sector);
})

//button
const buttonRadius = 70;
const button = new PIXI.Graphics();
button.beginFill(0xcf0300)
.drawCircle(0,0, buttonRadius)
.endFill();
button.interactive = true;
button.buttonMode = true;
button.cursor = 'pointer';
wheel.addChild(button);

const triangleGraphics = new PIXI.Graphics();
triangleGraphics.beginFill(0xcf0300); // Change the color as needed
triangleGraphics.moveTo(-15, -buttonRadius - 5);
triangleGraphics.lineTo(20, -buttonRadius - 5);
triangleGraphics.lineTo(0, -buttonRadius - 30);
triangleGraphics.lineTo(-20, -buttonRadius - 5);
triangleGraphics.endFill();
button.addChild(triangleGraphics);

const buttonText = new PIXI.Text('SPIN', { fill: 0xf3f6f4, fontSize: 35 });
buttonText.anchor.set(0.5, 0.5);
button.addChild(buttonText);

//event listeners
// Change button color on mouseover
button.on('pointerover', () => {
  button.clear();
  button.beginFill(0x1f2f32); // New color on mouseover, change as needed
  button.drawCircle(0, 0, buttonRadius);
  button.endFill();

  triangleGraphics.clear();
  triangleGraphics.beginFill(0x1f2f32);
  triangleGraphics.moveTo(-15, -buttonRadius - 5);
  triangleGraphics.lineTo(20, -buttonRadius - 5);
  triangleGraphics.lineTo(0, -buttonRadius - 30);
  triangleGraphics.lineTo(-20, -buttonRadius - 5);
  triangleGraphics.endFill();
});

// Restore original button color on mouseout
button.on('pointerout', () => {
  button.clear();
  button.beginFill(0xcf0300); // Original color on mouseout, change as needed
  button.drawCircle(0, 0, buttonRadius);
  button.endFill();

  triangleGraphics.clear();
  triangleGraphics.beginFill(0xcf0300);
  triangleGraphics.moveTo(-15, -buttonRadius - 5);
  triangleGraphics.lineTo(20, -buttonRadius - 5);
  triangleGraphics.lineTo(0, -buttonRadius - 30);
  triangleGraphics.lineTo(-20, -buttonRadius - 5);
  triangleGraphics.endFill();
});

button.on('pointerdown', onButtonClick);
window.addEventListener('resize', resize);


function onButtonClick() {
  if(!animating){
    animating = true
    let stopIndex = getRandomInt(0,sectorCount - 1);
    let stopDegrees = getRandomInt(2,30) * circleDeg - stopIndex * oneSector;

    gsap.to(sectorContainer, {
      rotation: `${stopDegrees}`, duration: 5, ease: "back.out(1.2)",
      onStart: ()=>{
        if(wheelSectors[stopIndex].text){
          buttonText.text = wheelSectors[stopIndex].text;
        } else {
          buttonText.text = wheelSectors[stopIndex].prize
        }
        
      },
      onComplete:()=>{
        animating = false
        buttonText.text = 'SPIN'
      }
    });
  }
}

//functions
function changeBgTexture(){
  bgBoxes.forEach((box,index)=>{
    box.addEventListener('click', function(){
      background.texture = bgTextures[index];
    })
  })
}

function resize() {
  app.renderer.resize(window.innerWidth, window.innerHeight);

  background.width = window.innerWidth;
  background.height = window.innerHeight;

  wheel.position.set(
    window.innerWidth / 2,
    window.innerHeight / 2 - radius / 3 
  );
  
  wheel.scale.set(window.innerWidth / 1920)
}

function createSector(startAngle, endAngle, item) {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(item.color);
  graphics.moveTo(0, 0);
  graphics.arc(0, 0, radius - 20, startAngle, endAngle);
  graphics.lineTo(0, 0);
  graphics.endFill();
  sectorContainer.addChild(graphics);

  // Calculate center coordinates
  const centerCoordinates = calculateCenterCoordinates(startAngle, endAngle);
  const rotationAngle = (startAngle + endAngle) / 2;

  // Add text to the center of the sector
  if(item.text){
    const text = new PIXI.Text(item.prize, { fill: 0x000, fontSize: 35 });
    text.anchor.set(0.5, 0.5);
    text.rotation = rotationAngle;
    text.position.set(centerCoordinates.x, centerCoordinates.y);
    sectorContainer.addChild(text);
  } else {
    const texture = PIXI.Texture.from(item.icon); 
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.rotation = rotationAngle;
    sprite.position.set(centerCoordinates.x, centerCoordinates.y);
    sprite.scale.set(0.15)
    sectorContainer.addChild(sprite);
  }

  return sectorContainer;
}

function calculateCenterCoordinates(startAngle, endAngle) {
  const angle = (startAngle + endAngle) / 2;
  const x = (radius / 1.3) * Math.cos(angle);
  const y = (radius / 1.3) * Math.sin(angle);
  return { x, y };
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
