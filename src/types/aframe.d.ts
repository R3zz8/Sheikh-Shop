declare global {
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

  interface Window {
    AFRAME: any;
  }
}

declare module 'aframe-react' {
  export const Scene: any;
  export const Entity: any;
  export const Box: any;
  export const Sphere: any;
  export const Plane: any;
  export const Text: any;
  export const Camera: any;
  export const Cursor: any;
  export const Light: any;
  export const Assets: any;
  export const AssetItem: any;
  export const GLTFModel: any;
}

export {};

