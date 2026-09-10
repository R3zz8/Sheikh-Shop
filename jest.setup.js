const { TransformStream } = require('web-streams-polyfill');
const { TextEncoder, TextDecoder } = require('util');
require('@testing-library/jest-dom');

global.TransformStream = TransformStream;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof global.Request === 'undefined') {
  try {
    const { Request, Response, Headers } = require('undici');
    global.Request = Request;
    global.Response = Response;
    global.Headers = Headers;
  } catch (e) {
    // Fallback if undici is not found
  }
}
