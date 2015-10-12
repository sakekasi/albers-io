import React from 'react';
import ReactDOM from 'react-dom';

import ColorPalette from './components/colorpalette.js';

ReactDOM.render(
  <ColorPalette source="http://localhost:8000/colors.json"/>,
  document.getElementById('palette')
);
