const { TransformStream } = require('web-streams-polyfill');
const { TextEncoder, TextDecoder } = require('util');
require('@testing-library/jest-dom');

global.TransformStream = TransformStream;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
