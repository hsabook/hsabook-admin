import $ from 'jquery';
import 'tinymce';
import '@wiris/mathtype-tinymce6';

export const setupMathType = () => {
  // Add jQuery to window
  window.$ = $;

  // Add MathType script
  const jsDemoImagesTransform = document.createElement('script');
  jsDemoImagesTransform.type = 'text/javascript';
  jsDemoImagesTransform.src = 'https://www.wiris.net/demo/plugins/app/WIRISplugins.js?viewer=image';
  document.head.appendChild(jsDemoImagesTransform);
};