import RetroBuffer from "./js/RetroBuffer.js";
import { Key } from "./js/utils.js";

const w = 128;
const h = 72;

const atlasURL = '/img/palette-bigger.webp';
let atlasImage = new Image();
atlasImage.src = atlasURL;

const bulbURL = '/img/ledbulbs-sheet.png'
let bulbImage = new Image();
bulbImage.src = bulbURL;

//keyboard event listeners
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);



atlasImage.onload = function(){ 
    console.log('atlas image loaded');
  let c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  let ctx = c.getContext('2d');
  ctx.drawImage(this, 0, 0);
  let atlas = new Uint32Array( ctx.getImageData(0,0,64, 64).data.buffer );
  window.r = new RetroBuffer(w, h, atlas, 10);
  init();
};

function init() {
    r.clr(0, r.PAGE_1);
    //create led lightbulb canvas
    const lightsCanvas = document.createElement('canvas');
    lightsCanvas.width = 128*11;
    lightsCanvas.height = 72*11;
    document.body.appendChild(lightsCanvas);
    window.lightsContext = lightsCanvas.getContext('2d');
    tick()
}

function renderBulbs() {
    for (let i = 0; i < 128; i++) {
        for (let j = 0; j < 72; j++) {
            let color = r.pget(i, j);
            let bulbState = r.pget(i,j, r.PAGE_1);
            let x = i * 11;
            let y = j * 11;
            lightsContext.drawImage(bulbImage, color * 11, bulbState * 11, 11, 11, x, y, 11, 11);
        }
    }
}

const textbanner = {
    text: 'HELLOO LEDSCREEN',
    x: 0,
    y: 20,
}

const player = {
    x: w/2,
    y: h/2,
}

function tick() {
    r.clr(0, r.SCREEN);
    randomScreenDamage();
    let { x, y, text } = textbanner;
    textbanner.x++;
    textbanner.x = textbanner.x % 256;  
    ///* [textstring, x, y, hspacing, vspacing, halign, valign, scale, color, offset, delay, frequency]
    r.text([text, x-128, y, 1, 1, "top", "left", 1, 2, 0, 0, 0]);
    
    r.strokePolygon(w/2, h/2, 20, 7, textbanner.x, 1);

    //player movement
    if (Key.isDown(Key.LEFT)) {
        player.x--;
    }
    if (Key.isDown(Key.RIGHT)) {
        player.x++;
    }
    if (Key.isDown(Key.UP)) {
        player.y--;
    }
    if (Key.isDown(Key.DOWN)) {
        player.y++;
    }
    //draw player    
    r.rect(player.x, player.y, 2, 2, 1);

    renderBulbs();
    Key.update();
    requestAnimationFrame(tick);
}

function randomScreenDamage() {
    r.clr(0, r.PAGE_1);
    r.renderTarget = r.PAGE_1;
    for (let i = 0; i < 1000; i++) {
        let x = Math.floor(Math.random() * w);
        let y = Math.floor(Math.random() * h);
        r.pset(x, y, 1);
    }
    r.renderTarget = r.SCREEN;
}