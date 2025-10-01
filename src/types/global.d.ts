declare global {
  interface Window {
    AFRAME: any;
  }
  
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-asset-item': any;
      'a-camera': any;
      'a-cursor': any;
      'a-light': any;
      'a-plane': any;
      'a-entity': any;
      'a-box': any;
      'a-text': any;
      'a-ring': any;
      'a-gltf-model': any;
      'model-viewer': any;
    }
  }
}

export {};


