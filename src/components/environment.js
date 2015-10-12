import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List, Map } from 'immutable';
import 'node-easel';

//actions
//
//external:
//add rectangle
//init
//
//internal:
//translate
//rotate
//scale
//clone
//delete

//for now, we expect appends to the same immutable array

export class Environment extends React.Component {
  rectangles: List<Rectangle>;
  shapes: Map<Rectangle, createjs.Shape>; //this is wrong.
  stage: ?createjs.Stage;
  container: ?createjs.Container;

  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    rectangles: ImmutablePropTypes.listOf(React.PropTypes.instanceOf(Rectangle)).isRequired
  }

  constructor(){
    this.rectangles = new List();
    this.shapes = new Map();
  }

  render(){
    return (
      <canvas ref="canvas"
              width={this.props.width}
              height={this.props.height}></canvas>
    );
  }

  componentDidMount(){
    //Init CreateJS
    var canvas = react.findDOMNode(this.refs.canvas);
    this.stage = new createjs.Stage(canvas);
    this.container = new createjs.Container();
    this.stage.addChild(container);
    //might not want to follow tick

    this.canvasWidth = this.stage.canvas.width;
    this.canvasHeight = this.stage.canvas.height;
    //add other attributes

    if( this.rectangles.size > 0 ){
      this.draw();
    }
  }

  componentWillRecieveProps(nextProps){
    if(nextProps.rectangles !== this.rectangles){
      this.rectangles = nextProps.rectangles;
    }

    //redraw
    // this.setState({rectangles: nextProps.rectangles});//may want to re-render somehow
  }

  draw(){
    this.shapes = this.shapes.merge(this.rectangles.map((rect) =>

    ));
  }
}

export class Rectangle {
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  rotation: number;

  constructor(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.scale = 1;
    this.rotation = 0;
  }
}
