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
//translate (no keys pressed, left click)
//rotate (shift pressed, left click)
//scale (ctrl pressed, left click)
//clone (right click)
//delete (shift pressed, right click)

//for now, we expect appends to the same immutable array

var update = false;

export class Environment extends React.Component {
  //rectangles: Map<string, Rectangle>;
  shapes: ?Map<string, createjs.Shape>;
  stage: ?createjs.Stage;
  container: ?createjs.Container;

  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    rectangles: ImmutablePropTypes.mapOf(React.PropTypes.instanceOf(Rectangle)).isRequired,
    updateRectState: React.PropTypes.func.isRequired; //called when rectangles are added or deleted from within
  }

  constructor(){
    //this.rectangles = new Map();
    //this.shapes = new Map();
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

    this.shapes = this.props.rectangles.map(rect => new EaselRectangle(rect));
    this.shapes.forEach(s => {
      this.contianer.addChild(s.shape);
    });

    createjs.Ticker.addEventListener("tick", this.tick);
  }

  componentWillRecieveProps(nextProps){
    if(nextProps.rectangles !== this.props.rectangles){
      let newShapes = nextProps.rectangles.filter((_, key) => this.shapes.has(key))
                          .map(rect => new EaselRectangle(rect));
      let removedShapes = this.shapes.filter((_, key) => !nextProps.rectangles.has(key));


      newShapes.forEach(s => {
        this.container.addChild(s.shape);
      });
      this.shapes = this.shapes.merge(newShapes)
                               .filter((_, key) => nextProps.rectangles.has(key));
                               //remove removed shapes


    }
  }

  tick(event){
    if(update){
      update = false;
      stage.update(event);
    }
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
  shape: createjs.Shape;
  state: string;
  offset: ?object;
  origClick: ?object;
  //default, translate, rotate, scale

  constructor(rect){
    super(rect.x, rect.y, rect.w, rect.h, rect.color);

    this.state = "DEFAULT";
    this.offset = null;
    this.origClick = null;

    this.shape = new createjs.Shape();
    this.shape.x = this.x;
    this.shape.y = this.y;
    this.shape.scaleX = shape.scaleY = this.scale;
    this.shape.rotation = this.rotation;

    shape.on("mousedown", (evt) => {
      if(evt.nativeEvent.button === 0){ //LEFT CLICK
        if(shift_pressed){ //rotate
          this.state = "ROTATE";
        } else if(ctrl_pressed){ //scale
          this.state = "TRANSLATE";
        } else { //translate
          this.state = "SCALE";
        }

        this.offset = {x: this.shape.x - evt.stageX, y: this.shape.y - evt.stageY};
        this.origClick = {x: evt.stageX, y: evt.stageY};
      } else if(evt.nativeEvent.button === 2){ //RIGHT CLICK

      }
    });

    shape.on("mouseup", (evt) => {
      this.state = "DEFAULT";
    });

    shape.on("pressmove", (evt) => {
      switch(this.state){
        case "TRANSLATE":
          this.shape.x = this.x = evt.stageX + this.offset.x;
          this.shape.y = this.y = evt.stageY + this.offset.y;
          update = true;
          break;
        case "ROTATE":
          let vec = {
            x: evt.stageX - this.origClick.x,
            y: evt.stageY - this.origClick.y
          };
          let theta = (Math.atan2(y, x) + Math.PI) * 360 / (2*MATH.PI);
          this.shape.rotation = this.rotation = theta;
          update = true;
          break;
        case "SCALE":
          //we'll come back to this one
      }
    });

    return shape;
  }

  updateShape( shape : createjs.Shape ) : createjs.Shape {
    shape.scaleX = shape.scaleY = this.scale;
    shape.rotation = this.rotation;

    return shape;
  }
}
