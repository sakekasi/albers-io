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
  rectangles: Map<string, Rectangle>;
  shapes: Map<string, createjs.Shape>;
  stage: ?createjs.Stage;
  container: ?createjs.Container;

  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    rectangles: ImmutablePropTypes.listOf(React.PropTypes.instanceOf(Rectangle)).isRequired,
    updateRectState: React.PropTypes.func.isRequired; //called when rectangles are added or deleted from within
  }

  constructor(){
    this.rectangles = new Map();
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

    this.stage.enableMouseOver(10);
    this.stage.mouseMoveOutside = true;

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
    this.rectangles.map((rect, key) => {
      if( this.shapes.has() )
    })

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
  color: Color;

  constructor(x, y, w, h, color){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.color = color;

    this.scale = 1;
    this.rotation = 0;
  }

}

class EaselRectangle extends Rectangle { //outside folks don't know about this one
  makeShape() : createjs.Shape {
    let shape = new createjs.Shape();
    shape.scaleX = shape.scaleY = this.scale;
    shape.rotation = this.rotation;

    shape.on("mousedown", function(evt){

    });

    shape.on("pressmove", function(evt){

    });

    return shape;
  }

  updateShape( shape : createjs.Shape ) : createjs.Shape {
    shape.scaleX = shape.scaleY = this.scale;
    shape.rotation = this.rotation;

    return shape;
  }
}
