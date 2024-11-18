export const undoStack = [];
export const redoStack = [];

export function saveState(actionDescription = '') {
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
          undoStack.shift();
        }
        redoStack = [];
        const skinViewer = document.getElementById('skin-viewer');
          let styleBlock = document.getElementById('dynamic-style');
          if (!styleBlock) {
            styleBlock = document.createElement('style');
            styleBlock.id = 'dynamic-style';
            document.head.appendChild(styleBlock);
          }
          styleBlock.textContent = `#skin-viewer * { background-image: url('${skinViewer}'); }`;
          updateSkinViewerStyle(img);
        displayHistory();
      };
    } else {
      alert("Please upload an image first.");
    }
  }
export function undo() {
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
        displayHistory();
      };
    } else {
      alert("No more actions to undo.");
    }
  }
export function redo() {
    if (redoStack.length > 0) {
      const nextState = redoStack.pop();
      undoStack.push(nextState);
      const preview = document.getElementById('image-preview');
      preview.src = nextState.imgData;
      originalImage = new Image();
      originalImage.src = nextState.imgData;
      displayHistory();
    } else {
      alert("No more actions to redo.");
    }
  }
export function displayHistory() {
    const historyContainer = document.getElementById('history');
    historyContainer.removeChild(historyContainer.firstChild);
    undoStack.forEach((state, index) => {
      const entry = document.createElement('div');
      entry.textContent = `Step ${index + 1}: ${state.actionDescription || 'Unnamed action'}`;
      historyContainer.appendChild(entry);
    });
  }
