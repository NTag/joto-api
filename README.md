# joto-api: send SVGs to your Joto

Make your https://joto.rocks draw a SVG with NodeJS.

## Installation

This module is meant to be used server-side, using NodeJS.

```bash
npm i joto-api
```

## Usage

```js
const JotoAPI = require('joto-api');

const drawSVG = async (svg) => {
  await JotoAPI.login('your@email.com', 'your-password');
  await JotoAPI.selectJoto(); // If you have multiple Jotos, you can pass the "Decide ID" or "Device Name" as a parameter
  await JotoAPI.drawSVG(svg);
};

// You can generate a SVG with https://github.com/NTag/joto-svg
const svg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="500" height="500">
  <g xmlns="http://www.w3.org/2000/svg">
    <path d="M277.2 224.32c0.51-1.34 0.8-2.8 0.8-4.32 0-6.63-5.38-12-12-12-2.46 0-4.76 0.75-6.66 2.02C255.88 204.03 249.41 200 242 200c-11.05 0-20 8.95-20 20 0 0.34 0.01 0.68 0.03 1.01C215.03 223.47 210 230.15 210 238c0 9.94 8.06 18 18 18h46c8.84 0 16-7.16 16-16 0-7.74-5.5-14.2-12.8-15.68z" />
  </g>
</svg>`;

drawSVG(svg);
```

## Related packages

- [joto-svg](https://github.com/NTag/joto-svg): create SVGs with icons, text, charts, for your Joto
