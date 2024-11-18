import { isPlaceholder, placeholderLoaded } from './state.js';

export function loadPlaceholder() {
  if (!placeholderLoaded) {
    const placeholderUrl = 'https://i.imgur.com/auCxTgN.jpg';
    const preview = document.getElementById('image-preview');
    preview.src = placeholderUrl;

    const skinViewerPlaceholder = 'https://i.imgur.com/JXntmsC.jpg';
    let styleBlock = document.getElementById('dynamic-style');
    if (!styleBlock) {
      styleBlock = document.createElement('style');
      styleBlock.id = 'dynamic-style';
      document.head.appendChild(styleBlock);
    }
    styleBlock.textContent = `#skin-viewer * { background-image: url('${skinViewerPlaceholder}'); }`;

    isPlaceholder = true;
    placeholderLoaded = true;
  }
}
export function updateSkinViewerStyle(image) {
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
