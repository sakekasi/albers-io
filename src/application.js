/* @flow */
import React from 'react';
import { Map } from 'immutable';
import chroma from 'chroma-js';
import $ from 'jquery';

import ColorPalette from './components/colorpalette.js';
import { Environment, Rectangle } from './components/environment.js';

export default class Application extends React.Component {
  nextRectNum: number;

  constructor(){
    super();
    this.state = {
      nextRectNum: 0,
      rectangles: new Map(),
    }
  }

  render(){
    return (
      <div>
        <ColorPalette source="colors.json" pickColor={this.pickColor.bind(this)} width={$("body").width()} height={$("body").height()}/>
        <Environment width={$('body').width() - 200} height={$('body').height() - 200} rectangles={this.state.rectangles}
                     updateRectState={this.updateRectState.bind(this)}/>
      </div>
    );
  }

  pickColor(color: Color){
    this.setState({
      rectangles: this.state.rectangles.set(
        (this.state.nextRectNum + 1).toString(),
        new Rectangle(150,150,100,100,color)
      ),
      nextRectNum: this.state.nextRectNum + 1,
    });
  }

  updateRectState(rectangles: Map<string, Rectangle> ){
    this.setState({rectangles});
  }
}
