import { originalImage, savedFileName, undoStack, isPlaceholder } from './state.js';
import { saveState } from './stateManagement.js';
import { analyzeGrayPixels } from './imageProcessing.js';
import { displayImageBackground } from './uiInteraction.js';
import { updateSkinViewerStyle } from './placeholder.js';

export function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    savedFileName = file.name.split('.').slice(0, -1).join('.');
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function () {
      if (img.width === 64 && img.height === 64) {
        originalImage = img;
        const preview = document.getElementById('image-preview');
        preview.src = img.src;
        preview.style.display = 'block';

        undoStack.length = 0; // Reset undo stack
        saveState('Imported custom Image');
        isPlaceholder = false;

        analyzeGrayPixels();
        displayImageBackground();
        updateSkinViewerStyle(img);
      } else {
        alert('Please upload an image with dimensions 64x64 pixels.');
      }
    };
  }
}
export function downloadImage() {
  const imageElement = document.getElementById('image-preview');
  if (!imageElement.src) {
    alert('No image to download. Please upload and edit an image first.');
    return;
  }

  const downloadLink = document.createElement('a');
  downloadLink.href = imageElement.src;
  downloadLink.download = savedFileName ? `${savedFileName}_edited.png` : 'downloaded_image.png';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
