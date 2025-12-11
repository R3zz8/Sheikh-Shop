import 'next';

declare module 'next' {
  interface NextConfig {
    reactCompiler?: boolean;
  }
}
