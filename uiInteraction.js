import { displayImageBackground } from './uiUtilities.js';

export function toggleSettingsMenu() {
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsIcon = document.getElementById('settingsIcon');
    settingsPanel.classList.toggle('open');
    settingsIcon.classList.toggle('open');
  }
export function updateToolUI(button, color, isActive) {
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
export function resetTools(excludeTool = null) {
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
export function togglePicking() {
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
export function toggleErase() {
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
  
export function toggleDraw() {
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
export function updatePosition() {
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
export function displayImageBackground(backgroundcolor) {
    const square1Position = { top: '232px', left: '326px', width: '640px', height: '640px'};
    const square2Position = { top: '920px', left: '550px', width: '450px', height: '700px'};
    function createSquare(id, position) {
      let square = document.getElementById(id);
      if (!square) {
        square = document.createElement('div');
        square.id = id;
        square.style.position = 'absolute';
        square.style.zIndex = '-2';
        document.body.appendChild(square);
      }
      square.style.top = position.top;
      square.style.left = position.left;
      square.style.width = position.width;
      square.style.height = position.height;
      square.style.backgroundColor = backgroundcolor || '#888869';
    }
    createSquare('image-background-square-1', square1Position);
    createSquare('image-background-square-2', square2Position);
  }
  
