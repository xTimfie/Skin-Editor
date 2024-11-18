import { drawPixel, erasePixel } from './imageProcessing.js';
import { displayImageBackground } from './uiUtilities.js';

document.getElementById('color-picker').addEventListener('input', function(event) {
  currentColor = event.target.value;
  console.log("Selected color from picker:", currentColor);
});
document.getElementById('image-preview').addEventListener('mousedown', function(event) {
  isMousePressed = true;
  if (drawEnabled) {
    drawPixel(event);
  } else if (eraseEnabled) {
    erasePixel(event);
  }
});
document.getElementById('image-preview').addEventListener('mouseup', function() {
  isMousePressed = false;
});
document.getElementById('image-preview').addEventListener('mousemove', function(event) {
  if (isMousePressed) {
    if (drawEnabled) {
      drawPixel(event);
    } else if (eraseEnabled) {
      erasePixel(event);
        }
      }
    });
    document.getElementById('image-preview').addEventListener('dragstart', function(event) {
      event.preventDefault();
    });

    document.getElementById('brightnessSlider').addEventListener('input', function() {
      const brightness = this.value;
      const grayValue = 255 * (brightness / 100);
      document.body.style.backgroundColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      const settingsPanel = document.getElementById('settingsPanel');
      settingsPanel.style.backgroundColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      settingsPanel.style.borderColor = brightness < 50 ? 'white' : 'black';
      document.body.style.color = brightness < 50 ? 'white' : 'black';
      settingsPanel.style.color = brightness < 50 ? 'white' : 'black';
      const imagePreview = document.getElementById('image-preview');
      imagePreview.style.borderColor = brightness < 50 ? 'white' : 'black';
    });
    document.getElementById('image-preview').addEventListener('click', function(event) {
      const imagePreview = document.getElementById('image-preview');
      const rect = imagePreview.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
    
      console.log(`Clicked at: (${x}, ${y})`);
    
      if (pickingEnabled) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imagePreview.naturalWidth;
        canvas.height = imagePreview.naturalHeight;
        ctx.drawImage(imagePreview, 0, 0, imagePreview.naturalWidth, imagePreview.naturalHeight);
    
        const pixel = ctx.getImageData(x * (imagePreview.naturalWidth / imagePreview.width), 
                                       y * (imagePreview.naturalHeight / imagePreview.height), 
                                       1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
        document.getElementById('colorDisplay').value = hex;
        currentColor = hex;
        console.log("Picked color from image:", currentColor);
      }
    });
    document.getElementById('hex-color').addEventListener('input', function(event) {
      const hexValue = event.target.value;
      if (/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(hexValue)) {
        currentColor = hexValue;
        console.log("Selected color from hex code:", currentColor);
      } else {
        console.log("Invalid hex code entered:", hexValue);
      }
    });

    document.getElementById('color-from-picker').addEventListener('change', function(event) {
      pickingEnabled = event.target.checked;  // Set pickingEnabled based on the checkbox state
      console.log(pickingEnabled ? "Color picker enabled." : "Color picker disabled.");
    });
    document.getElementById('background-color-picker').addEventListener('input', function () {
      displayImageBackground(this.value);
    });