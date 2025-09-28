declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'touch-action'?: string;
        onload?: () => void;
        onerror?: () => void;
        style?: React.CSSProperties;
        ar?: boolean;
        'ar-modes'?: string;
        'ios-src'?: string;
        poster?: string;
        children?: React.ReactNode;
      };
    }
  }
}

export {};

