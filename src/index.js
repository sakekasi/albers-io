/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import Application from './application.js';

ReactDOM.render(
  <Application/>,
  document.getElementById('palette')
);

global.$ = $;
