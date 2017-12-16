// FUNCTION DEFINITIONS

// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
const getRandomInt = function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// Get the shortest distance between a point (x,y) and a line defined by 
// (P1x, P1y) and (P2x, P2y).
// Source: https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
const distFromLine = function distFromLine(P1x, P1y, P2x, P2y, x, y) {
  const doubleTriArea = Math.abs((P2y - P1y) * x - (P2x - P1x) * y + P2x * P1y - P2y * P1x)
  const lineLength = Math.sqrt((P2y - P1y) ** 2 + (P2x - P1x) ** 2)
  return doubleTriArea / lineLength
}

// Take a vector (array of numbers) and return the same vector with unit length.
const normalizeVector = function normalizeVector(vector) {
  const length = Math.sqrt(
    vector
      .map(val => val ** 2)
      .reduce((acc, val) => acc += val, 0)
  )
  return vector.map(val => val / length)
}

// Return the values of a form DOM object as a JS object
const formToJson = function formToJson(form) {
  return Array.from(form.elements)
    .filter(elem => elem.tagName === 'INPUT' && elem.name !== '')
    .reduce((json, elem) => {
      let value = '';
      if (elem.type === 'checkbox') {
        value = elem.checked
      } else if (elem.type === 'range') {
        value = parseInt(elem.value)
      } else {
        value = elem.value
      }
    
      json[elem.name] = value; 
      return json;
    }, {})
}

// Source: http://www.vendian.org/mncharity/dir3/starcolor/
const starColors = [
  '#9db4ff',
  '#a2b9ff',
  '#a7bcff',
  '#aabfff',
  '#afc3ff',
  '#baccff',
  '#c0d1ff',
  '#cad8ff',
  '#e4e8ff',
  '#edeeff',
  '#fbf8ff',
  '#fbf8ff',
  '#fbf8ff',
  '#fbf8ff',
  '#fbf8ff',
  '#fbf8ff',
  '#fbf8ff',
  '#fbf8ff',
  '#fbf8ff',
  '#fbf8ff',
  '#fff9f9',
  '#fff5ec',
  '#fff4e8',
  '#fff1df',
  '#ffebd1',
  '#ffd7ae',
  '#ffc690',
  '#ffbe7f',
  '#ffbb7b',
  '#ffbb7b',
]

// Draw a star (little cross) at position (x,y) with a given thickness and color
const drawStar = function drawStar(ctx, x, y, thickness, color) {
  const oldFillStyle = ctx.fillStyle;
  
  ctx.fillStyle = color;
  // Top square
  ctx.fillRect(x + thickness, y, thickness, thickness);
  // Middle bar
  ctx.fillRect(x, y + thickness, 3 * thickness, thickness);
  // Bottom square
  ctx.fillRect(x + thickness, y + 2 * thickness, thickness, thickness);
  
  ctx.fillStyle = oldFillStyle;
}

// Draw a faint glowing band gradient that stretched between two points (x1, y1) and (x2, y2).
// width and height are the width and height of the canvas.
const drawGlowBand = function drawGlowBand(ctx, x1, y1, x2, y2, intensity, width, height) {
  const oldFillStyle = ctx.fillStyle;
  
  // Because the gradient is drawn orthoginally to the way we want it, we have to do some math
  // to figure out where the gradient *actually* starts and stops
  const brightnessVector = normalizeVector([(x2 - x1), (y2 - y1)])
  const orthoVector = normalizeVector([-brightnessVector[1], brightnessVector[0]])
  const brightnessDistance = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2)
  const orthoX1 = Math.floor(x1 + (brightnessDistance / 2) * (brightnessVector[0] + orthoVector[0]))
  const orthoY1 = Math.floor(y1 + (brightnessDistance / 2) * (brightnessVector[1] + orthoVector[1]))
  const orthoX2 = Math.floor(x1 + (brightnessDistance / 2) * (brightnessVector[0] - orthoVector[0]))
  const orthoY2 = Math.floor(y1 + (brightnessDistance / 2) * (brightnessVector[1] - orthoVector[1]))
  
  // Regular gradient has terrible banding at these brightness levels, so I used a 3rd party library
  // that lets you make gradients with dithering, which looks much better on phone screens.
  const gradient = new DitheredLinearGradient(orthoX1, orthoY1, orthoX2, orthoY2);
  gradient.addColorStop(0.00,0,0,0);
  gradient.addColorStop(0.45,intensity,intensity,intensity + 3);
  gradient.addColorStop(0.55,intensity,intensity,intensity + 3);
  gradient.addColorStop(1.00,0,0,0);
  gradient.fillRect(ctx, 0, 0, width, height);
  
  ctx.fillStyle = oldFillStyle;
}

// Combo function to do everything needed to render the starfield with options
const drawStarfield = function DrawOnCanvas(ctx, width, height, options) {
  // Black background
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.fillRect(0, 0, width, height);
  
  
  // Define line of brightness
  const [P1x, P1y] = [0, getRandomInt(0, height)];
  const [P2x, P2y] = [width, getRandomInt(0, height)];
  
  if (options.glowBand) {
    // Make a glow behind it
    drawGlowBand(ctx, P1x, P1y, P2x, P2y, options.glowBandIntensity, width, height)
  }
  
  // Draw a bunch of randomly placed stars
  for (let i = 0; i < options.starCount; i++) {
    const x = getRandomInt(0, width);
    const y = getRandomInt(0, height);
    
    let starThickness = getRandomInt(0, 4);
    // If `brightConcentration` is enabled, make star thickness/brightness
    // a function of the distance between the star and the line of brightness.
    if (options.brightConcentration) {
      const distFromBrightness = distFromLine(P1x, P1y, P2x, P2y, x, y);
      starThickness = distFromBrightness < 500 ?
        Math.floor((-3 / 500) * distFromBrightness + 4) :
        1
    } 
    
    let starColor = '#ffffff'
    if (options.starColors) {
      starColor = starColors[getRandomInt(0, starColors.length)]  
    } 
    
    drawStar(ctx, x, y, starThickness, starColor);
  }
}

// EXECUTION
const canvas = document.getElementById('star-canvas');
if (!canvas.getContext) {
  alert('Sorry, your browser doesn\'t support the <canvas> element.');
  throw new Error('Canvas unsupported');
}

const saveImageLink = document.getElementById('save-image-link')
const form = document.querySelector('#customize-form');

// Setup event listeners
form.addEventListener('submit', event => {
  event.preventDefault()
  const formContents = formToJson(event.target)
  drawStarfield(canvas.getContext('2d'), canvas.width, canvas.height, formContents);
  saveImageLink.href = canvas.toDataURL();
});

const displayRangeOutput = (outputElement) => {
  return event => {
    const value = event.target.value;
    outputElement.textContent = value;
  }
}

form.querySelector('input[name="glowBand"]').addEventListener('change', event => {
  if (event.target.checked) {
    form.querySelector('input[name="glowBandIntensity"]').disabled = false;
    document.getElementById('glow-band-intensity-group').style.display = 'block';
  } else {
    form.querySelector('input[name="glowBandIntensity"]').disabled = true;
    document.getElementById('glow-band-intensity-group').style.display = 'none';
  }
})

form.querySelector('input[name="starCount"]').addEventListener('input', displayRangeOutput(form.querySelector('output[name="star-count-output"]')));
form.querySelector('input[name="starCount"]').addEventListener('change', displayRangeOutput(form.querySelector('output[name="star-count-output"]')));

form.querySelector('input[name="glowBandIntensity"]').addEventListener('input', displayRangeOutput(form.querySelector('output[name="glow-band-intensity-output"]')));
form.querySelector('input[name="glowBandIntensity"]').addEventListener('change', displayRangeOutput(form.querySelector('output[name="glow-band-intensity-output"]')));

// Render a starfield on page load
const formContents = formToJson(form)
drawStarfield(canvas.getContext('2d'), canvas.width, canvas.height, formContents);
saveImageLink.href = canvas.toDataURL();