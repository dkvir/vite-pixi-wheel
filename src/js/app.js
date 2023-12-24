import * as PIXI from 'pixi.js';
import { gsap } from "gsap";
import PixiPlugin from "gsap/PixiPlugin";
import { Sprite } from 'pixi.js';

//load PIXI
const app = new PIXI.Application({
  width: window.innerWidth,
  height:window.innerHeight,
  resizeTo: window,
  background: 0x000000,
  backgroundAlpha: 0,
  view: document.querySelector('.canvas'),
})

app.renderer.view.style.position = 'absolute'
const loader = PIXI.Loader.shared;

loader.add('backgroundGreen', '/images/background-1.avif')
.add('backgroundBlue', '/images/background-2.avif')
.add('backgroundRed', '/images/background-3.avif')
.add('iron', '/images/icons/iron.png')
.add('home', '/images/icons/home.png')
.add('bike', '/images/icons/bike.png')
.add('car', '/images/icons/car.png')
.load(setup)

//containers
const wheel = new PIXI.Container();
const sectorContainer = new PIXI.Container();
const boxesContainer = new PIXI.Container();

//global variables
let wheelSectors, sectorCount, bgBoxes, oneSector, background, bgTextures, boxContainerHeight;
let radius = window.innerWidth / 6;
const buttonRadius = 70;
const circleDeg =  Math.PI * 2;
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
let animating = false;
const boxWidth = 150;
const boxHeight = 71;


function setup(loader, resources){
  gsap.registerPlugin(PixiPlugin);
  PixiPlugin.registerPIXI(PIXI);

  wheelSectors = [
    {
      text: "2M",
      prize: "2M",
      color: 0xf9b807,
    },
    {
      icon: resources.iron.texture,
      prize: "Iron",
      color: 0x25d22,
    },
    {
      text: "3M",
      prize: "3M",
      color: 0xe54746,
    },
    {
      icon: resources.car.texture,
      prize: "Car",
      color: 0x269271,
    },
    {
      text: "1M",
      prize: "1M",
      color: 0x376fa3,
    },
    {
      icon: resources.home.texture,
      prize: "Home",
      color: 0x9a1c4b,
    },
    {
      text: "5M",
      prize: "5M",
      color: 0xd6d4c6,
    },
    {
      icon: resources.bike.texture,
      prize: "Bike",
      color: 0x676854,
    },
  ]
  sectorCount = wheelSectors.length;

  boxContainerHeight = sectorCount * boxHeight;
  bgBoxes = document.querySelectorAll('.change-bg .box')
  oneSector = circleDeg / sectorCount;

  //background texture
  bgTextures = [resources.backgroundGreen, resources.backgroundBlue, resources.backgroundRed]
  background = new Sprite(bgTextures[0].texture);
  background.width = window.innerWidth;
  background.height = window.innerHeight;
  app.stage.addChild(background);

  // change background textures
  changeBgTexture(background);


  //wheel container
  wheel.position.set(centerX, centerY);
  app.stage.addChild(wheel);


  // wheel graphics
  const wheelGraphicsBg = new PIXI.Graphics();
  wheelGraphicsBg.beginFill(0x1f2f32).arc(0, 0, radius, 0, 360);
  wheel.addChild(wheelGraphicsBg);

  //boxes container
  boxesContainer.position.set(centerX - boxWidth - 20, centerY - boxContainerHeight - 215);
  const boxContainerBg = new PIXI.Graphics();
  boxContainerBg.beginFill(0x1f2f32); 
  boxContainerBg.drawRect(-10, -10, boxWidth + 20, boxHeight * sectorCount + 20);
  boxContainerBg.endFill();
  // boxesContainer.addChild(boxContainerBg);
  wheel.addChild(boxesContainer);

  wheelSectors.forEach((item, i)=>{
    const startAngle = (i * circleDeg) / sectorCount - 5 * (oneSector /2);
    const endAngle = ((i + 1) * circleDeg) / sectorCount - 5 * (oneSector /2);

    // Create sector
    const sector = createSector(startAngle, endAngle, item);
    wheel.addChild(sector);

    createBoxes(i, item);
  })

  //button
  const button = new PIXI.Graphics();
  button.beginFill(0xcf0300)
  .drawCircle(0,0, buttonRadius)
  .endFill();
  button.interactive = true;
  button.buttonMode = true;
  button.cursor = 'pointer';
  wheel.addChild(button);

  const triangleGraphics = new PIXI.Graphics();
  triangleGraphics.beginFill(0xcf0300); 
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
  button.on('pointerover', ()=> {
    gsap.to(button, {
      pixi: {
        tint: 0x1f2f32
      },
      duration: 0.25,
    })

    gsap.to(triangleGraphics, {
      pixi: {
        tint: 0x1f2f32
      },
      duration: 0.25,
    })
  });

  button.on('pointerout', () => {
    gsap.to(button, {
      pixi: {
        tint: 0xcf0300
      },
      duration: 0.25,
    })

    gsap.to(triangleGraphics, {
      pixi: {
        tint: 0xcf0300
      },
      duration: 0.25,
    })
  });

  button.on('pointerdown',()=> onButtonClick(buttonText));
  window.addEventListener('resize', resize);

}

//functions
function onButtonClick(buttonText) {
  if(!animating){
    animating = true
    let stopIndex = getRandomInt(0,sectorCount - 1);
    let stopDegrees = getRandomInt(2,30) * circleDeg - stopIndex * oneSector;

    gsap.to(sectorContainer, {
      rotation: stopDegrees, 
      duration: 5, 
      ease: "back.out(1.2)",
      onStart: ()=>{
        if(wheelSectors[stopIndex].text){
          buttonText.text = wheelSectors[stopIndex].text;
        } else {
          buttonText.text = wheelSectors[stopIndex].prize
        }
        
      },
      onComplete:()=>{
        animateWinned(wheelSectors[stopIndex], buttonText);
        animateWinned(wheelSectors[stopIndex], false);
      }
    });
  }
}

function changeBgTexture(background){
  bgBoxes.forEach((box,index)=>{
    box.addEventListener('click', function(){
      background.texture = bgTextures[index].texture;
    })
  })
}

function resize() {
  app.renderer.resize(window.innerWidth, window.innerHeight);

  background.width = window.innerWidth;
  background.height = window.innerHeight;

  wheel.position.set(
    window.innerWidth / 2,
    window.innerHeight / 2 
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
  graphics.name = item.prize
  sectorContainer.addChild(graphics);

  // Calculate center coordinates
  const centerCoordinates = calculateCenterCoordinates(startAngle, endAngle);
  const rotationAngle = (startAngle + endAngle) / 2;

  if(item.text){
    const text = new PIXI.Text(item.prize, { fill: 0x000, fontSize: 35 });
    text.anchor.set(0.5, 0.5);
    text.rotation = rotationAngle;
    text.position.set(centerCoordinates.x, centerCoordinates.y);
    sectorContainer.addChild(text);
  } else {
    const sprite = new PIXI.Sprite(item.icon);
    sprite.anchor.set(0.5, 0.5);
    sprite.rotation = rotationAngle;
    sprite.position.set(centerCoordinates.x, centerCoordinates.y);
    sprite.scale.set(0.15)
    sectorContainer.addChild(sprite);
  }

  return sectorContainer;
}


function createBoxes(i, item){
  const box = new PIXI.Graphics();
  box.beginFill(item.color); 
  box.drawRect(0, 0, boxWidth, boxHeight);
  box.endFill();
  box.position.set(0, i * boxHeight);
  box.alpha = 0.5;
  box.name = item.prize
  boxesContainer.addChild(box);

  if(item.text){
    const text = new PIXI.Text(item.prize, { fill: 0x000, fontSize: 35 });
    text.anchor.set(0.5);
    text.position.set(boxWidth / 2, boxHeight / 2 + boxHeight * i);
    boxesContainer.addChild(text);
  } else {
    const sprite = new PIXI.Sprite(item.icon);
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(boxWidth / 2, boxHeight / 2 + boxHeight * i);
    sprite.scale.set(0.1)
    boxesContainer.addChild(sprite);
  }
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

function animateWinned(item, box){
  const graphics = box ? boxesContainer.getChildByName(item.prize) : sectorContainer.getChildByName(item.prize)

  const tl = gsap.timeline({ 
    repeat: 3,
    onStart:()=>{
      if(box) box.alpha = 1 
    },
    onComplete:()=>{ 
      if(box){ 
        box.text = 'SPIN'
      } else {
        animating = false
      }
      graphics.pixi.tint = item.color
    },
   })

  tl.to(graphics, {
    pixi: {
    	tint: 0x39b6ff
    },
    duration: 0.1,
    ease: "power1.in",
  }, '>')
  .to(graphics, {
    pixi: {
    	tint: 0xfce9d5
    },
    duration: 0.1,
    ease: "power1.in",
  },'>')
  .to(graphics, {
    pixi: {
    	tint: 0xe86343
    },
    duration: 0.1,
    ease: "power1.in",
  }, '>')
  .to(graphics, {
    pixi: {
    	tint: item.color
    },
    duration: 0.1,
    ease: "power1.in",
  }, '>')
}
