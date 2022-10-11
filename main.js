import RetroBuffer from "./js/RetroBuffer.js";
import { Key } from "./js/utils.js";

const w = 128;
const h = 72;

const atlasURL = 'img/palette-bigger.webp';
let atlasImage = new Image();
atlasImage.src = atlasURL;

const bulbURL = 'img/ledbulbs-sheet.png'
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
    let scale = 10;
    r.clr(0, r.PAGE_1);
    //create led lightbulb canvas
    const lightsCanvas = document.createElement('canvas');
    lightsCanvas.width = 128*11;
    lightsCanvas.height = 72*11;
    document.body.appendChild(lightsCanvas);

    //create bulb 'palette' canvas
    window.bulbCanvas = document.createElement('canvas');
    bulbCanvas.width = 11*64;
    bulbCanvas.height = 11*8;
    window.bulbContext = bulbCanvas.getContext('2d');
    window.lightsContext = lightsCanvas.getContext('2d');
    bulbContext.fillStyle = 'black';
    bulbContext.fillRect(0,0, bulbCanvas.width, bulbCanvas.height);

    //these functions create pallettes with different subpixel geometries, 1 per row
    createBulbPaletteVerticalBars();
    createBulbPaletteHorizontalBars(11)
    createBulbPalettePenTile1(22);
    createBulbPalettePenTile2(33);
    document.body.append(bulbCanvas);
    bulbCanvas.style.imageRendering = 'pixelated';
    bulbCanvas.style.width = '100%';
    bulbCanvas.style.overflow = 'hidden';
    tick()
}

function renderBulbs() {
    for (let i = 0; i < 128; i++) {
        for (let j = 0; j < 72; j++) {
            let color = r.pget(i, j);
            let bulbState = r.pget(i,j, r.PAGE_1);
            let x = i * 11;
            let y = j * 11;
            lightsContext.drawImage(bulbCanvas, color * 11, bulbState * 11, 11, 11, x, y, 11, 11);
        }
    }
}

const textbanner = {
    text: 'GREETS TO FELLOW GAMEDEVS',
    x: 0,
    y: 20,
}

const state = {
    t: 0
}

const player = {
    x: w/2,
    y: h/2,
}

function tick() {
    state.t++;
    r.clr(0, r.SCREEN);
    randomScreenDamage();
    bulbTypeFill();
    let { x, y, text } = textbanner;
    textbanner.x--;
    textbanner.x = textbanner.x % 550;  
    ///* [textstring, x, y, hspacing, vspacing, halign, valign, scale, color, offset, delay, frequency]
    for(let i = 0; i < 20; i++) {
        r.strokePolygon(w/2, h/2, 5 + i*4, 7, Math.sin(state.t/50 + i), 4+i)
    }


    r.text([text, x+256, y+2, 1, 1, "top", "right", 2, 0, 0, 0, 0]);
    r.text([text, x+256, y, 1, 1, "top", "right", 2, 21, 0, 0, 0]);
    paletteGrid();

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
    r.render();
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
        r.pset(x, y, Math.random() > 0.5 ? 1 : 0);
    }
    r.renderTarget = r.SCREEN;
}

function bulbTypeFill() {
    r.clr(0, r.PAGE_1);
    r.renderTarget = r.PAGE_1; 
    //dither 8 is checkerboard dither, we're filling 0 and 1.
    //renderbulbs will draw the correct bulb type for each pixel based on this value
    r.pat = r.dither[0];
    r.fillRect(0, 0, w, h, 3);
    r.pat = r.dither[0];
    r.renderTarget = r.SCREEN;
}

function paletteGrid() {
    r.renderTarget = r.SCREEN;
    for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 2; j++) {
            r.fillRect(i*4, j*4, 4, 4, i+j*32);
        }
    }
}

function createBulbPaletteVerticalBars() {
    
    for (let i = 0; i < 64; i++) {
        //r.colors is a Uint32Array of the palette colors
        //r.colors[i] includex alpha 0xAABBGGRR
        //we need to remove the alpha and convert to hex 0xRRGGBB
        let color = r.colors[i];
        let hex = color.toString(16);
        let R = hex.slice(6,8);
        let G = hex.slice(4,6);
        let B = hex.slice(2,4);
        let hexColor = '#' + R + G + B;
        let red = `#${R}0000`;
        let green = `#00${G}00`;
        let blue = `#0000${B}`;

        bulbContext.fillStyle = red;
        bulbContext.fillRect(i*11+1, 1, 3, 10);
        bulbContext.fillStyle = green;
        bulbContext.fillRect(i*11+4, 1, 3, 10);
        bulbContext.fillStyle = blue;
        bulbContext.fillRect(i*11+7, 1, 3, 10);
;
    }
}

function createBulbPaletteHorizontalBars(rowOffset=0) {
   
    for (let i = 0; i < 64; i++) {
        //r.colors is a Uint32Array of the palette colors
        //r.colors[i] includex alpha 0xAABBGGRR
        //we need to remove the alpha and convert to hex 0xRRGGBB
        let color = r.colors[i];
        let hex = color.toString(16);
        let R = hex.slice(6,8);
        let G = hex.slice(4,6);
        let B = hex.slice(2,4);
        let hexColor = '#' + R + G + B;
        let red = `#${R}0000`;
        let green = `#00${G}00`;
        let blue = `#0000${B}`;

        bulbContext.fillStyle = red;
        bulbContext.fillRect(i*11+1, rowOffset+1, 10, 3);
        bulbContext.fillStyle = green;
        bulbContext.fillRect(i*11+1, rowOffset+4, 10, 3);
        bulbContext.fillStyle = blue;
        bulbContext.fillRect(i*11+1, rowOffset+7, 10, 3);
;
    }
}
function createBulbPalettePenTile1(rowOffset=22) {
   
    for (let i = 0; i < 64; i++) {
        //r.colors is a Uint32Array of the palette colors
        //r.colors[i] includex alpha 0xAABBGGRR
        //we need to remove the alpha and convert to hex 0xRRGGBB
        let color = r.colors[i];
        let hex = color.toString(16);
        let R = hex.slice(6,8);
        let G = hex.slice(4,6);
        let B = hex.slice(2,4);
        let hexColor = '#' + R + G + B;
        let red = `#${R}0000`;
        let green = `#00${G}00`;
        let blue = `#0000${B}`;

        bulbContext.fillStyle = red;
        bulbContext.fillRect(i*11+1, rowOffset+1, 3, 3);
        bulbContext.fillRect(i*11+4, rowOffset+4, 3, 3);
        bulbContext.fillRect(i*11+7, rowOffset+7, 3, 3);
        bulbContext.fillStyle = green;
        bulbContext.fillRect(i*11+1, rowOffset+4, 3, 3);
        bulbContext.fillRect(i*11+4, rowOffset+7, 3, 3);
        bulbContext.fillRect(i*11+7, rowOffset+1, 3, 3);
        bulbContext.fillStyle = blue;
        bulbContext.fillRect(i*11+1, rowOffset+7, 3, 3);
        bulbContext.fillRect(i*11+4, rowOffset+1, 3, 3);
        bulbContext.fillRect(i*11+7, rowOffset+4, 3, 3);
;
    }
}
function createBulbPalettePenTile2(rowOffset=33) {
   
    for (let i = 0; i < 64; i++) {
        //r.colors is a Uint32Array of the palette colors
        //r.colors[i] includex alpha 0xAABBGGRR
        //we need to remove the alpha and convert to hex 0xRRGGBB
        let color = r.colors[i];
        let hex = color.toString(16);
        let R = hex.slice(6,8);
        let G = hex.slice(4,6);
        let B = hex.slice(2,4);
        let hexColor = '#' + R + G + B;
        let red = `#${R}0000`;
        let green = `#00${G}00`;
        let blue = `#0000${B}`;

        bulbContext.fillStyle = green;
        bulbContext.fillRect(i*11+1, rowOffset+1, 3, 3);
        bulbContext.fillRect(i*11+4, rowOffset+4, 3, 3);
        bulbContext.fillRect(i*11+7, rowOffset+7, 3, 3);
        bulbContext.fillStyle = red;
        bulbContext.fillRect(i*11+4, rowOffset+1, 3, 3);
        bulbContext.fillRect(i*11+7, rowOffset+1, 3, 3);
        bulbContext.fillRect(i*11+7, rowOffset+4, 3, 3);
        bulbContext.fillStyle = blue;
        bulbContext.fillRect(i*11+1, rowOffset+4, 3, 3);
        bulbContext.fillRect(i*11+1, rowOffset+7, 3, 3);
        bulbContext.fillRect(i*11+4, rowOffset+7, 3, 3);
;
    }
}