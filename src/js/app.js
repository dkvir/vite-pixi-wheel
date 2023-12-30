import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import PixiPlugin from 'gsap/PixiPlugin';
import { Sprite } from 'pixi.js';

//load PIXI
const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  resizeTo: window,
  background: 0x000000,
  backgroundAlpha: 0,
  view: document.querySelector('.canvas'),
  antialias: true,
});

app.renderer.resize(window.innerWidth, window.innerHeight);
const loader = PIXI.Loader.shared;

loader
  .add('backgroundGreen', '/images/background-1.avif')
  .add('backgroundBlue', '/images/background-2.avif')
  .add('backgroundRed', '/images/background-3.avif')
  .add('iron', '/images/icons/iron.png')
  .add('home', '/images/icons/home.png')
  .add('bike', '/images/icons/bike.png')
  .add('car', '/images/icons/car.png')
  .load(setup);

//containers
const wheelContainer = new PIXI.Container();
const sectorContainer = new PIXI.Container();
const boxesContainer = new PIXI.Container();

//global variables
let wheelSectors,
  sectorCount,
  bgBoxes,
  oneSector,
  background,
  bgTextures,
  boxContainerHeight;
let activeBackgroundIndex = 0;
let radius = 400;
let fullCircle = 5;
const buttonRadius = 70;
const circleDeg = Math.PI * 2;
let animating = false;
const boxWidth = 150;
const boxHeight = 71;

function setup(loader, resources) {
  initLoader();

  gsap.registerPlugin(PixiPlugin);
  PixiPlugin.registerPIXI(PIXI);

  wheelSectors = [
    {
      text: '2M',
      prize: '2M',
      color: 0xf9b807,
    },
    {
      icon: resources.iron.texture,
      prize: 'Iron',
      color: 0x25d22,
    },
    {
      text: '3M',
      prize: '3M',
      color: 0xe54746,
    },
    {
      icon: resources.car.texture,
      prize: 'Car',
      color: 0x269271,
    },
    {
      text: '1M',
      prize: '1M',
      color: 0x376fa3,
    },
    {
      icon: resources.home.texture,
      prize: 'Home',
      color: 0x9a1c4b,
    },
    {
      text: '5M',
      prize: '5M',
      color: 0xd6d4c6,
    },
    {
      icon: resources.bike.texture,
      prize: 'Bike',
      color: 0x676854,
    },
  ];
  sectorCount = wheelSectors.length;

  boxContainerHeight = sectorCount * boxHeight;
  oneSector = circleDeg / sectorCount;

  //background texture
  bgTextures = [
    resources.backgroundGreen,
    resources.backgroundBlue,
    resources.backgroundRed,
  ];

  bgBoxes = document.querySelectorAll('.change-bg .box');
  bgBoxes[0].classList.add('is-active');

  background = new Sprite(bgTextures[0].texture);
  background.width = window.innerWidth;
  background.height = window.innerHeight;
  app.stage.addChild(background);

  // change background textures
  changeBgTexture(background);

  //wheel container
  wheelContainer.position.set(window.innerWidth / 2, window.innerHeight / 2);
  app.stage.addChild(wheelContainer);

  // wheel graphics
  const wheelGraphicsBg = new PIXI.Graphics();
  wheelGraphicsBg.beginFill(0x1f2f32).arc(0, 0, radius, 0, 360);
  wheelContainer.addChild(wheelGraphicsBg);

  //boxes container
  boxesContainer.position.set(
    window.innerWidth - boxWidth - 20,
    window.innerHeight / 2 - boxContainerHeight / 2
  );
  app.stage.addChild(boxesContainer);

  wheelSectors.forEach((item, i) => {
    const startAngle = (i * circleDeg) / sectorCount - 5 * (oneSector / 2);
    const endAngle = ((i + 1) * circleDeg) / sectorCount - 5 * (oneSector / 2);

    // Create sector
    const sector = createSector(startAngle, endAngle, item);
    wheelContainer.addChild(sector);

    createBoxes(i, item);
  });

  //button
  const button = new PIXI.Graphics();
  button.beginFill(0xcf0300).drawCircle(0, 0, buttonRadius).endFill();
  button.interactive = true;
  button.buttonMode = true;
  button.cursor = 'pointer';
  wheelContainer.addChild(button);

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
  button.on('pointerover', () => {
    gsap.to(button, {
      pixi: {
        tint: 0x1f2f32,
      },
      duration: 0.25,
    });

    gsap.to(triangleGraphics, {
      pixi: {
        tint: 0x1f2f32,
      },
      duration: 0.25,
    });
  });

  button.on('pointerout', () => {
    gsap.to(button, {
      pixi: {
        tint: 0xcf0300,
      },
      duration: 0.25,
    });

    gsap.to(triangleGraphics, {
      pixi: {
        tint: 0xcf0300,
      },
      duration: 0.25,
    });
  });

  button.on('pointerdown', () => onButtonClick(buttonText));
  resize();
  window.addEventListener('resize', resize);
}

//functions
function onButtonClick(buttonText) {
  if (!animating) {
    animating = true;
    let stopIndex = getRandomInt(0, sectorCount - 1);
    let stopDegrees = fullCircle * circleDeg - stopIndex * oneSector;

    gsap.to(sectorContainer, {
      rotation: stopDegrees,
      duration: 4,
      ease: 'back.out(1.2)',
      onStart: () => {
        if (wheelSectors[stopIndex].text) {
          buttonText.text = wheelSectors[stopIndex].text;
        } else {
          buttonText.text = wheelSectors[stopIndex].prize;
        }
      },
      onComplete: () => {
        animateWinned(wheelSectors[stopIndex], buttonText);
        animateWinned(wheelSectors[stopIndex], false);
        fullCircle += 5;
      },
    });
  }
}

function changeBgTexture(background) {
  bgBoxes.forEach((box, index) => {
    box.addEventListener('click', function () {
      bgBoxes[activeBackgroundIndex].classList.remove('is-active');
      activeBackgroundIndex = index;
      background.texture = bgTextures[index].texture;
      bgBoxes[activeBackgroundIndex].classList.add('is-active');
    });
  });
}

function resize() {
  if (window.innerWidth > 820) {
    boxesContainer.scale.set(1);
    wheelContainer.scale.set(window.innerWidth / 1920);
    wheelContainer.position.set(window.innerWidth / 2, window.innerHeight / 2);
  } else if (window.innerWidth <= 820 && window.innerWidth > 540) {
    boxesContainer.scale.set(0.7);
    wheelContainer.scale.set(0.6);
    wheelContainer.position.set(
      window.innerWidth / 2 - wheelContainer.width / 8,
      window.innerHeight / 2
    );
  } else if (window.innerWidth <= 540) {
    boxesContainer.scale.set(0.5);
    wheelContainer.scale.set(0.3);
    wheelContainer.position.set(
      window.innerWidth / 2 - wheelContainer.width / 6,
      window.innerHeight / 2
    );
  }

  background.width = window.innerWidth;
  background.height = window.innerHeight;

  boxesContainer.position.set(
    window.innerWidth - boxesContainer.width - 20,
    window.innerHeight / 2 - boxesContainer.height / 2
  );
}

function createSector(startAngle, endAngle, item) {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(item.color);
  graphics.moveTo(0, 0);
  graphics.arc(0, 0, radius - 20, startAngle, endAngle);
  graphics.lineTo(0, 0);
  graphics.endFill();
  graphics.name = item.prize;
  sectorContainer.addChild(graphics);

  // Calculate center coordinates
  const centerCoordinates = calculateCenterCoordinates(startAngle, endAngle);
  const rotationAngle = (startAngle + endAngle) / 2;

  if (item.text) {
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
    sprite.scale.set(0.15);
    sectorContainer.addChild(sprite);
  }

  return sectorContainer;
}

function createBoxes(i, item) {
  const box = new PIXI.Graphics();
  box.beginFill(item.color);
  box.drawRect(0, 0, boxWidth, boxHeight);
  box.endFill();
  box.position.set(0, i * boxHeight);
  box.alpha = 0.5;
  box.name = item.prize;
  boxesContainer.addChild(box);

  if (item.text) {
    const text = new PIXI.Text(item.prize, { fill: 0x000, fontSize: 35 });
    text.anchor.set(0.5);
    text.position.set(boxWidth / 2, boxHeight / 2 + boxHeight * i);
    boxesContainer.addChild(text);
  } else {
    const sprite = new PIXI.Sprite(item.icon);
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(boxWidth / 2, boxHeight / 2 + boxHeight * i);
    sprite.scale.set(0.1);
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

function animateWinned(item, box) {
  const graphics = box
    ? boxesContainer.getChildByName(item.prize)
    : sectorContainer.getChildByName(item.prize);

  const tl = gsap.timeline({
    repeat: 3,
    onStart: () => {
      if (box) {
        graphics.alpha = 1;
      }
    },
    onComplete: () => {
      if (box) {
        box.text = 'SPIN';
        setTimeout(() => {
          graphics.alpha = 0.3;
        }, 1500);
      } else {
        animating = false;
      }
    },
  });

  tl.to(
    graphics,
    {
      pixi: {
        tint: 0x39b6ff,
      },
      duration: 0.1,
      ease: 'power1.in',
    },
    '>'
  )
    .to(
      graphics,
      {
        pixi: {
          tint: 0xfce9d5,
        },
        duration: 0.1,
        ease: 'power1.in',
      },
      '>'
    )
    .to(
      graphics,
      {
        pixi: {
          tint: 0xe86343,
        },
        duration: 0.1,
        ease: 'power1.in',
      },
      '>'
    )
    .to(
      graphics,
      {
        pixi: {
          tint: item.color,
        },
        duration: 0.1,
        ease: 'power1.in',
      },
      '>'
    );
}

function initLoader() {
  const loader = document.querySelector('.loader');

  const tl = gsap.timeline({
    onComplete: () => {
      loader.classList.add('loaded');
    },
  });

  tl.to('.loader .img', {
    rotate: 5 * 360,
    duration: 3,
    ease: 'back.out(1.2)',
  })
    .to(
      '.loader .img',
      {
        scale: 0,
        duration: 0.5,
        ease: 'power1.in',
      },
      '>'
    )
    .to(
      '.loader ',
      {
        '--circle-width': '100%',
        duration: 0.5,
        ease: 'power1.in',
      },
      '-=0.2'
    );
}
