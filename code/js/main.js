import * as State from './state.js';
import { previewImage, downloadImage } from './imageUtils.js';
import { loadPlaceholder, updateSkinViewerStyle } from './placeholder.js';
import * as ImageProcessing from './imageProcessing.js';
import * as StateManagement from './stateManagement.js';
import * as UIInteraction from './uiInteraction.js';
import * as Utils from './utils.js';
import * as EventListeners from './eventListeners.js';
import { loadPlaceholder } from './initialization.js';


window.onload = function() {
  loadPlaceholder();
  UIInteraction.displayImageBackground('#888869');
};

window.previewImage = previewImage;
window.downloadImage = downloadImage;
window.ImageProcessing = ImageProcessing;
window.StateManagement = StateManagement;
window.UIInteraction = UIInteraction;
window.Utils = Utils;
