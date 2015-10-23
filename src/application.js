/* @flow */
import React from 'react';
import { Map } from 'immutable';
import chroma from 'chroma-js';

import ColorPalette from './components/colorpalette.js';
import { Environment, Rectangle } from './components/environment.js';

export default class Application extends React.Component {
  nextRectNum: number;

  constructor(){
    super();
    this.state = {
      nextRectNum: 1,
      rectangles: new Map({"0": new Rectangle(0, 0, 50, 70, chroma('black'))}),
    }
  }

  render(){
    return (
      <div>
        <ColorPalette source="http://localhost:8000/colors.json" pickColor={this.pickColor.bind(this)}/>
        <Environment width={500} height={500} rectangles={this.state.rectangles}
                     updateRectState={this.updateRectState.bind(this)}/>
      </div>
    );
  }

  pickColor(color: Color){
    this.setState({
      rectangles: this.state.rectangles.set(
        (this.state.nextRectNum + 1).toString(),
        new Rectangle(50,50,100,50,color)
      ),
      nextRectNum: this.state.nextRectNum + 1,
    });
  }

  updateRectState(rectangles: Map<string, Rectangle> ){
    this.setState({rectangles});
  }
}
