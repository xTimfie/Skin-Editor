import { saveState } from './stateManagement.js';

export function drawPixel(event) {
    const imagePreview = document.getElementById('image-preview');
    const rect = imagePreview.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (drawEnabled) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(currentImage, 0, 0);
      
      const canvasX = Math.floor(x * (originalImage.width / imagePreview.clientWidth));
      const canvasY = Math.floor(y * (originalImage.height / imagePreview.clientHeight));
      console.log(`Drawing at: (${canvasX}, ${canvasY}) with color: ${currentColor}`);
      ctx.fillStyle = currentColor;
      ctx.fillRect(canvasX, canvasY, 1, 1);
      
      imagePreview.src = canvas.toDataURL();
      const updatedImage = new Image();
      updatedImage.src = canvas.toDataURL();
      updatedImage.onload = function() {
        currentImage = updatedImage;
      };
      saveState(`Drew Pixel at (${canvasX}, ${canvasY}) with color ${currentColor}`);
    }
    requestAnimationFrame(() => {
      displayHistory();
    });
  }
export function erasePixel(event) {
    const imagePreview = document.getElementById('image-preview');
    const rect = imagePreview.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    console.log(`Erasing at: (${x}, ${y})`);
  
    if (eraseEnabled) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(currentImage, 0, 0);
        const canvasX = Math.floor(x * (originalImage.width / imagePreview.clientWidth));
        const canvasY = Math.floor(y * (originalImage.height / imagePreview.clientHeight));
        console.log(`Mapped coordinates: (${canvasX}, ${canvasY})`);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const index = (canvasY * canvas.width + canvasX) * 4;
        data[index + 3] = 0;
        ctx.putImageData(imageData, 0, 0);
        imagePreview.src = canvas.toDataURL();
        const updatedImage = new Image();
        updatedImage.src = canvas.toDataURL();
        updatedImage.onload = function() {
            currentImage = updatedImage;
        };
        saveState(`Erased Pixel at (${canvasX}, ${canvasY})`);
    }
    requestAnimationFrame(() => {
        displayHistory();
    });
  }
export function applyColorOverlay() {
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
export function applyColorTint(specifiedColorHex) {
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
export function makeBlackAndWhite() {
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
export function overlaySignature() {
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
export function overlayCustomImage(event) {
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
export function adjustHue(hueValue) {
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
export function invertColors() {
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
export function makeTransparent() {
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
export function isTransparent(y, x, imageData) {
    const idx = (y * 64 + x) * 4;
    return imageData[idx + 3] === 0;
  }
export function changeColor() {
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
export function applyGrayBrightness() {
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
export function analyzeGrayPixels() {
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
export function updateGrayValue(value) {
    document.getElementById('gray-level-display').textContent = value;
  }
  