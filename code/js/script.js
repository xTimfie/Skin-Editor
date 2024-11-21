let originalImage = null;
let savedImage = null;
let savedFileName = '';
let undoStack = [];
let redoStack = [];
let grayPixels = [];
let isPlaceholder = false;
let pickingEnabled = false;
let eraseEnabled = false;
let isMousePressed = false;
let drawEnabled = false;
let currentColor = '#000000';
let currentDesign = 1;
let imageImported = false;



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
    document.getElementById('image-preview').addEventListener('click', function (event) {
      const imagePreview = document.getElementById('image-preview');
      const rect = imagePreview.getBoundingClientRect();
    
      // Click coordinates relative to the image
      const xClick = event.clientX - rect.left;
      const yClick = event.clientY - rect.top;
    
      // Calculate the scaling factor
      const correctionFactor = imagePreview.naturalWidth / rect.width;
    
      // Apply the correction factor
      const xCanvas = Math.floor(xClick * correctionFactor);
      const yCanvas = Math.floor(yClick * correctionFactor);
    
      if (pickingEnabled) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imagePreview.naturalWidth;
        canvas.height = imagePreview.naturalHeight;
        ctx.drawImage(imagePreview, 0, 0, imagePreview.naturalWidth, imagePreview.naturalHeight);
    
        // Get the color data at the corrected coordinates
        const pixel = ctx.getImageData(xCanvas, yCanvas, 1, 1).data;
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

window.onload = function() {
  loadPlaceholder();
displayImageBackground('');
};


function toggleSettingsMenu() {
      const settingsPanel = document.getElementById('settingsPanel');
      const settingsIcon = document.getElementById('settingsIcon');
      settingsPanel.classList.toggle('open');
      settingsIcon.classList.toggle('open');
    }


    function loadPlaceholder() {
      if (!isPlaceholder) {
        const skinViewerPlaceholder = 'https://i.imgur.com/JXntmsC.jpg';
        
        let styleBlock = document.getElementById('dynamic-style');
        if (!styleBlock) {
          styleBlock = document.createElement('style');
          styleBlock.id = 'dynamic-style';
          document.head.appendChild(styleBlock);
        }
    
        // Apply the placeholder background image dynamically to #skin-viewer
        styleBlock.textContent = `#skin-viewer * { background-image: url('${skinViewerPlaceholder}'); }`;
        
        // Mark the placeholder as loaded
        isPlaceholder = true;
      }
    }



    function undo() {
      if (undoStack.length > 1) {
        const currentState = undoStack.pop();
        redoStack.push(currentState);
        const previousState = undoStack[undoStack.length - 1];
        const preview = document.getElementById('image-preview');
        const img = new Image();
        img.src = previousState.imgData;
        img.onload = function() {
          preview.src = img.src;
          originalImage = img;
        };
      } else {
        alert("No more actions to undo.");
      }
    }
    function redo() {
      if (redoStack.length > 0) {
        const nextState = redoStack.pop();
        undoStack.push(nextState);
        const preview = document.getElementById('image-preview');
        preview.src = nextState.imgData;
        originalImage = new Image();
        originalImage.src = nextState.imgData;
      } else {
        alert("No more actions to redo.");
      }
    }




function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    savedFileName = file.name.split('.').slice(0, -1).join('.');
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function() {
      if (img.width === 64 && img.height === 64) {
        originalImage = img;
        currentImage = img;
        const preview = document.getElementById('image-preview');
        preview.src = img.src;
        preview.style.display = 'block';
        undoStack = [];
        redoStack = [];
        saveState('Imported custom Image');
        isPlaceholder = false;
        analyzeGrayPixels();
        updateSkinViewerStyle(img);
      } else {
        alert("Please upload an image with dimensions 64x64 pixels.");
      }
    };
  }
}

function updateSkinViewerStyle(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const imageDataUrl = canvas.toDataURL('image/png');
  let styleBlock = document.getElementById('dynamic-style');
  if (!styleBlock) {
    styleBlock = document.createElement('style');
    styleBlock.id = 'dynamic-style';
    document.head.appendChild(styleBlock);
  }
  styleBlock.textContent = `#skin-viewer * { background-image: url('${imageDataUrl}'); }`;
}

function saveState(actionDescription = '') {
  const preview = document.getElementById('image-preview');
  if (preview.src) {
    const img = new Image();
    img.src = preview.src;
    img.onload = function() {
      originalImage = img;
      currentImage = img;
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(originalImage, 0, 0);
      const imageData = canvas.toDataURL();
      undoStack.push({ imgData: imageData, actionDescription });

      if (undoStack.length > 50) {
        undoStack.shift(); // Limit history size
      }
      redoStack = [];
    };
  } else {
    alert("Please upload an image first.");
  }
}

function downloadImage() {
  const imageElement = document.getElementById('image-preview');
  if (!imageElement.src) {
    alert("No image to download. Please upload and edit an image first.");
    return;
  }
  const downloadLink = document.createElement('a');
  downloadLink.href = imageElement.src;
  downloadLink.download = savedFileName ? `${savedFileName}_edited.png` : 'downloaded_image.png';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function toggleDesign(){
  if (currentDesign == 1) {
    currentDesign = 2;
    document.documentElement.style.setProperty('--text-color', '#27372B');
    document.documentElement.style.setProperty('--field-color', '#a6a68f');
    document.documentElement.style.setProperty('--button-color', '#27372B');
    document.documentElement.style.setProperty('--background-color', '#888869');
    document.getElementById('background-image').style.backgroundImage = 'url("https://i.imgur.com/jyVh8ng.jpg")';
    document.getElementById('image-preview').style.imagePreview  = 'url("https://i.imgur.com/6CIBRCf.jpg")';
  }
  else {
    currentDesign = 1;
    document.documentElement.style.setProperty('--text-color', '#bdbdbd');
    document.documentElement.style.setProperty('--field-color', '#3b3c3d');
    document.documentElement.style.setProperty('--button-color', '#ffd69c');
    document.documentElement.style.setProperty('--background-color', '#1c2025');
    document.getElementById('background-image').style.backgroundImage = 'url("https://i.imgur.com/0ZDESaJ.jpg")';
    document.getElementById('image-preview').style.imagePreview = 'url("https://i.imgur.com/cJlVpR8.jpg")';
  }
}

function resetTools(excludeTool = null) {
  if (excludeTool !== 'picking') {
    pickingEnabled = false;
    const pickingButton = document.querySelector('.color-pick-button button');
    if (pickingButton) pickingButton.style.color = '';
  }
  if (excludeTool !== 'erase') {
    eraseEnabled = false;
    const eraseButton = document.querySelector('.erase-pixel-button button');
    if (eraseButton) eraseButton.style.color = '';
  }
  if (excludeTool !== 'draw') {
    drawEnabled = false;
    const drawButton = document.querySelector('.draw-pixel-button');
    if (drawButton) drawButton.style.color = '';
  }
  const image = document.getElementById('image-preview');
  if (image) {
    image.classList.remove('pointer-cursor');
  }
}

function updateToolUI(button, color, isActive) {
  const image = document.getElementById('image-preview');
  if (isActive) {
    button.style.color = color;
    if (image) {
      image.classList.add('pointer-cursor');
    }
  } else {
    button.style.color = '';
    if (image) {
      image.classList.remove('pointer-cursor');
    }
  }
}

function togglePicking() {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  if (pickingEnabled) {
    pickingEnabled = false;
    const button = document.querySelector('.color-pick-button button');
    updateToolUI(button, '#32c800', false);
    return;
  }
  resetTools('picking');
  pickingEnabled = true;
  const button = document.querySelector('.color-pick-button button');
  updateToolUI(button, '#32c800', true);
}

function toggleErase() {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  if (eraseEnabled) {
    eraseEnabled = false;
    const button = document.querySelector('.erase-pixel-button button');
    updateToolUI(button, '#c83232', false);
    return;
  }
  resetTools('erase');
  eraseEnabled = true;
  const button = document.querySelector('.erase-pixel-button button');
  updateToolUI(button, '#c83232', true);
}

function toggleDraw() {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  if (drawEnabled) {
    drawEnabled = false;
    const button = document.querySelector('.draw-pixel-button');
    updateToolUI(button, '#32c832', false);
    return;
  }
  resetTools('draw');
  drawEnabled = true;
  const button = document.querySelector('.draw-pixel-button');
  updateToolUI(button, '#32c832', true);
}

function updateToolUI(button, color, isActive) {
  const image = document.getElementById('image-preview');
  if (isActive) {
    button.style.color = color;
    if (image) {
      image.classList.add('pointer-cursor');
    }
  } else {
    button.style.color = '';
    if (image) {
      image.classList.remove('pointer-cursor');
    }
  }
}


function erasePixel(event) {
  const imagePreview = document.getElementById('image-preview');
  const rect = imagePreview.getBoundingClientRect();

  // Click coordinates relative to the image
  const xClick = event.clientX - rect.left;
  const yClick = event.clientY - rect.top;

  // Calculate the scaling factor
  const correctionFactor = imagePreview.naturalWidth / rect.width;

  // Apply the correction factor
  const xCanvas = Math.floor(xClick * correctionFactor);
  const yCanvas = Math.floor(yClick * correctionFactor);

  if (eraseEnabled) {
    const canvas = document.createElement('canvas');
    canvas.width = imagePreview.naturalWidth;
    canvas.height = imagePreview.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(currentImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const index = (yCanvas * canvas.width + xCanvas) * 4;

    // Check if the pixel is already fully transparent (erased)
    if (data[index + 3] === 0) {
      return; // Don't execute erase if already erased
    }

    // Make the pixel fully transparent
    data[index + 3] = 0;
    ctx.putImageData(imageData, 0, 0);

    // Update image preview
    imagePreview.src = canvas.toDataURL();
    const updatedImage = new Image();
    updatedImage.src = canvas.toDataURL();
    updatedImage.onload = function() {
      currentImage = updatedImage;
    };

    saveState(`Erased Pixel at (${xCanvas}, ${yCanvas})`);
  }
}


function drawPixel(event) {
  const imagePreview = document.getElementById('image-preview');
  const rect = imagePreview.getBoundingClientRect();

  // Click coordinates relative to the image
  const xClick = event.clientX - rect.left;
  const yClick = event.clientY - rect.top;

  // Calculate the scaling factor
  const correctionFactor = imagePreview.naturalWidth / rect.width;

  // Apply the correction factor
  const xCanvas = Math.floor(xClick * correctionFactor);
  const yCanvas = Math.floor(yClick * correctionFactor);

  if (drawEnabled) {
    const canvas = document.createElement('canvas');
    canvas.width = imagePreview.naturalWidth;
    canvas.height = imagePreview.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(currentImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const index = (yCanvas * canvas.width + xCanvas) * 4;

    // Check if the pixel already has the desired color (currentColor)
    const currentPixelColor = `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${data[index + 3] / 255})`;
    const targetColor = currentColor;  // Ensure currentColor is a string like 'rgb(r, g, b)' or 'rgba(r, g, b, a)'

    if (currentPixelColor === targetColor) {
      return; // Don't execute draw if the pixel is already the target color
    }

    // Draw the pixel with the current color
    ctx.fillStyle = currentColor;
    ctx.fillRect(xCanvas, yCanvas, 1, 1);

    // Update image preview
    imagePreview.src = canvas.toDataURL();
    const updatedImage = new Image();
    updatedImage.src = canvas.toDataURL();
    updatedImage.onload = function() {
      currentImage = updatedImage;
    };

    saveState(`Drew Pixel at (${xCanvas}, ${yCanvas})`);
  }
}



function changeColor() {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }

  const colorToReplaceHex = document.getElementById('color-to-replace').value;
  const newColorHex = document.getElementById('new-color').value;

  if (!/^#([0-9A-F]{3}){1,2}$/i.test(colorToReplaceHex) || !/^#([0-9A-F]{3}){1,2}$/i.test(newColorHex)) {
    alert("Please enter valid hex color codes.");
    return;
  }

  const colorToReplace = hexToRgb(colorToReplaceHex);
  const newColor = hexToRgb(newColorHex);

  const canvas = document.createElement('canvas');
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a !== 0 && r === colorToReplace.r && g === colorToReplace.g && b === colorToReplace.b) {
      data[i] = newColor.r;
      data[i + 1] = newColor.g;
      data[i + 2] = newColor.b;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  document.getElementById('image-preview').src = canvas.toDataURL();
  originalImage.src = canvas.toDataURL();
  saveState('Color Changed');
}


function makeTransparent() {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  const colorToRemoveHex = document.getElementById('color-to-remove').value;
  const colorToRemove = hexToRgb(colorToRemoveHex);
  const canvas = document.createElement('canvas');
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a !== 0 && r === colorToRemove.r && g === colorToRemove.g && b === colorToRemove.b) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  document.getElementById('image-preview').src = canvas.toDataURL();
  saveState('Made Transparent');
}


function applyColorOverlay() {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  const overlayColorHex = document.getElementById('overlay-color').value;
  const overlayOpacity = parseFloat(document.getElementById('overlay-opacity').value) / 100;
  const overlayGrayOnly = document.getElementById('overlay-gray-only').checked;
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(overlayColorHex)) {
    alert("Please enter a valid hex color code.");
    return;
  }
  const overlayColor = hexToRgb(overlayColorHex);
  const canvas = document.createElement('canvas');
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a !== 0) {
      const isGrayish = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
      if (!overlayGrayOnly || isGrayish) {
        data[i] = data[i] * (1 - overlayOpacity) + overlayColor.r * overlayOpacity;
        data[i + 1] = data[i + 1] * (1 - overlayOpacity) + overlayColor.g * overlayOpacity;
        data[i + 2] = data[i + 2] * (1 - overlayOpacity) + overlayColor.b * overlayOpacity;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  document.getElementById('image-preview').src = canvas.toDataURL();
  saveState('Applied Overlay');
}


function applyColorTint(specifiedColorHex) {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  const specifiedColor = hexToRgb(specifiedColorHex);
  if (!specifiedColor) {
    alert("Please enter a valid hex color code.");
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let totalBrightness = 0;
  let pixelCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    const luminance = 0.3 * r + 0.59 * g + 0.11 * b;
    data[i] = data[i + 1] = data[i + 2] = luminance;
    if (alpha !== 0) {
      totalBrightness += luminance;
      pixelCount++;
    }
  }
  const avgBrightness = totalBrightness / pixelCount;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = data[i];
    const alpha = data[i + 3];
    if (alpha !== 0) {
      const relativeBrightness = brightness / avgBrightness;
      data[i] = Math.min(255, specifiedColor.r * relativeBrightness);
      data[i + 1] = Math.min(255, specifiedColor.g * relativeBrightness);
      data[i + 2] = Math.min(255, specifiedColor.b * relativeBrightness);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  document.getElementById('image-preview').src = canvas.toDataURL();
  originalImage.src = canvas.toDataURL();
  saveState('Applied Tint');
}


function adjustHue(hueValue) {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 0) {
      const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
      const [r, g, b] = hslToRgb((h + parseInt(hueValue)) % 360, s, l);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const preview = document.getElementById('image-preview');
  preview.src = canvas.toDataURL();
  saveState('Hue Adjusted');
}


function invertColors() {
    if (!originalImage || isPlaceholder) {
        alert("Please upload an image first.");
        return;
    }
    const isGrayOnly = document.getElementById('invert-gray-checkbox').checked;
    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
        if (a !== 0) {
            if (isGrayOnly) {
                const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
                if (isGray) {
                    data[i] = 255 - r;
                    data[i + 1] = 255 - g;
                    data[i + 2] = 255 - b;
                }
            } else {
                data[i] = 255 - r;
                data[i + 1] = 255 - g;
                data[i + 2] = 255 - b;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
    document.getElementById('image-preview').src = canvas.toDataURL();
    saveState(isGrayOnly ? 'Inverted Gray Pixels' : 'Inverted Image');
}



function overlaySignature() {
  const preview = document.getElementById('image-preview');
  if (!preview.src || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0);
  const signature = new Image();
  signature.crossOrigin = 'anonymous';
  signature.src = 'https://i.imgur.com/goV2X0p.png';


  signature.onload = function() {
    ctx.drawImage(signature, 0, 0, canvas.width, canvas.height);
    preview.src = canvas.toDataURL();
    const combinedImage = new Image();
    combinedImage.src = canvas.toDataURL();
    originalImage = combinedImage;
  };
  saveState('Applied Signature Overlay');
}


function makeBlackAndWhite() {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    const luminance = 0.3 * r + 0.59 * g + 0.11 * b;
    data[i] = data[i + 1] = data[i + 2] = luminance;
    data[i + 3] = alpha;
  }
  ctx.putImageData(imageData, 0, 0);
  document.getElementById('image-preview').src = canvas.toDataURL();
  originalImage.src = canvas.toDataURL();
  saveState('Made Back and White');
}


function overlayCustomImage(event) {
  if (!originalImage || isPlaceholder) {
      alert("Please upload an image first.");
      return;
  }
  const file = event.target.files[0];
  if (!file) return;
  const overlayImage = new Image();
  overlayImage.src = URL.createObjectURL(file);
  overlayImage.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const placement = document.getElementById('placement-select').value;
      const gravityEnabled = document.getElementById('gravity-toggle').checked;
      ctx.drawImage(originalImage, 0, 0, 64, 64);
      const imageData = ctx.getImageData(0, 0, 64, 64);
      const data = imageData.data;
      const overlayCanvas = document.createElement('canvas');
      overlayCanvas.width = overlayImage.width;
      overlayCanvas.height = overlayImage.height;
      const overlayCtx = overlayCanvas.getContext('2d');
      overlayCtx.drawImage(overlayImage, 0, 0);
      const overlayData = overlayCtx.getImageData(0, 0, overlayImage.width, overlayImage.height);
      const overlayPixels = overlayData.data;
      for (let y = 0; y < overlayImage.height; y++) {
          for (let x = 0; x < overlayImage.width; x++) {
              const idx = (y * overlayImage.width + x) * 4;
              const overlayAlpha = overlayPixels[idx + 3];
              if (overlayAlpha > 0) {
                  if (gravityEnabled) {
                      const targetIdx = (y * 64 + x) * 4;
                      const originalAlpha = data[targetIdx + 3];
                      if (originalAlpha > 0) {
                          data[targetIdx] = overlayPixels[idx];
                          data[targetIdx + 1] = overlayPixels[idx + 1];
                          data[targetIdx + 2] = overlayPixels[idx + 2];
                          data[targetIdx + 3] = 255;
                      }
                  } else {
                      const targetIdx = (y * 64 + x) * 4;
                      data[targetIdx] = overlayPixels[idx];
                      data[targetIdx + 1] = overlayPixels[idx + 1];
                      data[targetIdx + 2] = overlayPixels[idx + 2];
                      data[targetIdx + 3] = 255;
                  }
              }
          }
      }
      ctx.putImageData(imageData, 0, 0);
      const preview = document.getElementById('image-preview');
      preview.src = canvas.toDataURL();
      const combinedImage = new Image();
      combinedImage.src = canvas.toDataURL();
      originalImage = combinedImage;
      saveState('Applied a custom Image Overlay');
  };
  overlayImage.onerror = function () {
      alert('Error loading the overlay image.');
  };
}

function isTransparent(y, x, imageData) {
  const idx = (y * 64 + x) * 4;
  return imageData[idx + 3] === 0;
}




function applyGrayBrightness() {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  const newLightestBrightness = parseInt(document.getElementById('lightest-gray-slider').value, 10);
  const canvas = document.createElement('canvas');
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  grayPixels.forEach(pixel => {
    const newBrightness = newLightestBrightness + pixel.relativeBrightness;
    const clampedBrightness = Math.min(255, Math.max(0, newBrightness));
    data[pixel.index] = clampedBrightness;
    data[pixel.index + 1] = clampedBrightness;
    data[pixel.index + 2] = clampedBrightness;
  });
  ctx.putImageData(imageData, 0, 0);
  document.getElementById('image-preview').src = canvas.toDataURL();
  saveState('Adjusted the Brightness of gray pixels');
}




function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;
  h /= 360;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  function rgbToHex(r, g, b) {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function analyzeGrayPixels() {
  if (!originalImage || isPlaceholder) {
    alert("Please upload an image first.");
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImage, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  grayPixels = [];
  let minBrightness = 255;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a !== 0 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
      const brightness = r;
      grayPixels.push({ index: i, brightness });
      if (brightness < minBrightness) {
        minBrightness = brightness;
      }
    }
  }
  grayPixels = grayPixels.map(pixel => ({
    index: pixel.index,
    relativeBrightness: pixel.brightness - minBrightness
  }));
}

function updateGrayValue(value) {
  document.getElementById('gray-level-display').textContent = value;
}

function updatePosition() {
  const className = document.getElementById("class-input").value.trim();
  const topPosition = document.getElementById("top-slider").value + "px";
  const leftPosition = document.getElementById("left-slider").value + "px";
  if (className) {
    const elements = document.getElementsByClassName(className);
    for (let element of elements) {
      element.style.position = 'absolute';
      element.style.top = topPosition;
      element.style.left = leftPosition;
    }
    const firstElement = elements[0];
    const currentTop = firstElement.style.top || '0px';
    const currentLeft = firstElement.style.left || '0px';
    document.getElementById("current-top").value = currentTop;
    document.getElementById("current-left").value = currentLeft;
  }
}

function displayImageBackground(backgroundcolor) {
  const square1Position = { top: '232px', left: '326px', width: '640px', height: '640px'};
  const square2Position = { top: '920px', left: '550px', width: '450px', height: '700px'};
  function createSquare(id, position) {
    let square = document.getElementById(id);
    if (!square) {
      square = document.createElement('div');
      square.id = id;
      square.classList.add('square');
      square.style.position = 'absolute';
      square.style.zIndex = '-2';
      document.body.appendChild(square);
    }
    square.style.top = position.top;
    square.style.left = position.left;
    square.style.width = position.width;
    square.style.height = position.height;
    document.documentElement.style.setProperty('--background-color', backgroundcolor);
  }
  createSquare('image-background-square-1', square1Position);
  createSquare('image-background-square-2', square2Position);
}
document.getElementById('background-color-picker').addEventListener('input', function () {
  displayImageBackground(this.value);
});
