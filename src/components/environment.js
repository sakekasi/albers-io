import React from 'react';
import ReactDOM from 'react-dom';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List, Map } from 'immutable';
import $ from 'jquery';

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

var update = false;

export class Environment extends React.Component {
  // shapes: ?Map<string, createjs.Shape>;
  // stage: ?createjs.Stage;
  // container: ?createjs.Container;

  constructor(){
    super();
    this.state = {
      shapes: new Map(),
      stage: null,
      container: new createjs.Container(),
      update: false
    }
  }

  render(): React.Component {
    let horizontalMargin = ($('body').width() - this.props.width) / 2;
    let verticalMargin = ($('body').height() - this.props.height) / 2;
    let style = {left: horizontalMargin, top: verticalMargin};
    return (
      <canvas ref="canvas" style={style}
              // onKeyDown={this.keyDown.bind(this)}
              // onKeyUp={this.keyUp.bind(this)}
              width={this.props.width}
              height={this.props.height}></canvas>
    );
  }

  componentDidMount(){
    let canvas = ReactDOM.findDOMNode(this.refs.canvas);
    let stage = new createjs.Stage(canvas);
    createjs.Touch.enable(stage);
    stage.addChild(this.state.container);

    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true;


    let shapes = this.props.rectangles.map(rect => new EaselRectangle(rect, this));
    shapes.forEach(s => {
      this.state.container.addChild(s.container);
      // s.shape.cache();
    });

    createjs.Ticker.addEventListener("tick", this.tick.bind(this));
    this.setState({
      stage, shapes,
      update: true
    });
  }

  componentWillReceiveProps(nextProps){
    let added, removed;
    added = nextProps.rectangles.filter((_, key) => !this.state.shapes.has(key));
    removed = this.state.shapes.filter((_, key) => !nextProps.rectangles.has(key));

    let shapes = this.state.shapes.merge(
      added.map(rect => new EaselRectangle(rect, this))
    );

    added.forEach((_, key) => {
      this.state.container.addChild(shapes.get(key).container);
    });
    removed.forEach((_, key) => {
      this.state.container.removeChild(shapes.get(key).container);
      shapes = shapes.delete(key);
    });

    this.setState({
      shapes,
      update: true
    });
  }

  shouldComponentUpdate(nextProps, nextState){
    return false; //TODO; doublecheck this
  }

  tick(event){
    if(this.state.update){
      this.state.stage.update();
      this.setState({
        update: false
      });
    }
  }
}
// Environment.propTypes = {
//   width: React.PropTypes.number.isRequired,
//   height: React.PropTypes.number.isRequired,
//   rectangles: ImmutablePropTypes.mapOf(React.PropTypes.instanceOf(Rectangle)).isRequired,
//   updateRectState: React.PropTypes.func.isRequired, //called when rectangles are added or deleted from within
// };

export class Rectangle {
  x: number;
  y: number;
  w: number;
  h: number;
  // scale: number;
  rotation: number;
  color: Color;

  constructor(x, y, w, h, color){
    this.x = x;
    this.y = y;

    this.w = w;
    this.h = h;

    this.color = color;

    // this.scale = 1;
    this.rotation = 0;//Math.random()*50-25;
  }

}

class EaselRectangle { //outside folks don't know about this one
  rectangle: createjs.Shape;
  state: string;
  original: ?Object;
  container: ?Object;
  delegate: ?Object;
  environment: Environment;

  get x(){
    return this.delegate.x;
  }
  set x(newX){
    this.container.x = newX;
    this.delegate.x = newX;
  }

  get y(){
    return this.delegate.y;
  }
  set y(newY){
    this.container.y = newY;
    this.delegate.y = newY;
  }

  get w(){
    return this.delegate.w;
  }
  set w(newW){
    this.rectangle.scaleX = newW/100;
    this.delegate.w = newW;
  }

  get h(){
    return this.delegate.h;
  }
  set h(newH){
    this.rectangle.scaleY = newH/100;
    this.delegate.h = newH;
  }

  get rotation(){
    return this.delegate.rotation;
  }
  set rotation(newRotation){
    this.rectangle.rotation = newRotation;
    this.delegate.rotation = newRotation;
  }

  get container(){
    if(!this.hasOwnProperty("_container")){
      this._container = new createjs.Container();
    }
    return this._container;
  }
  set container(newContainer){
    this._container = newContainer;
  }

  get rectangle(){
    if(!this.hasOwnProperty("_rectangle")){
      this._rectangle = new createjs.Shape();
      this.container.addChild(this._rectangle);
    }
    return this._rectangle;
  }
  set rectangle(newRectangle){
    this._rectangle = newRectangle;
  }

  constructor(rect, environment){
    // this.container = new createjs.Container();
    // this.rectangle = new createjs.Shape();
    // this.container.addChild(this.rectangle);
    // super(rect.x, rect.y, rect.w, rect.h, rect.color);
    this.delegate = rect;
    this.environment = environment;
    this.rectangle.graphics.beginFill(this.delegate.color.hex()).drawRect(-50, -50, 100, 100).endFill();

    //setup initial mapping
    this.x = this.x;
    this.y = this.y;
    this.w = this.w;
    this.h = this.h;

    this.state = "DEFAULT";

    //don't know how sensible it is to maintain parallel variables
    // this.container.x = this.x;
    // this.container.y = this.y;
    // this.rectangle.scaleX = this.rectangle.scaleY = this.scale;
    // this.rectangle.rotation = this.rotation;

    this.rectangle.on("mousedown", (evt) => {
      console.log("mousedown", evt);
      if(evt.nativeEvent.button === 0){ //LEFT CLICK
        if(evt.nativeEvent.shiftKey){
          this.state = "ROTATE";
        } else if(evt.nativeEvent.ctrlKey){
          this.state = "SCALE";
        } else {
          this.state = "TRANSLATE";
        }

        this.original = {
          centerVector: {
            x: this.x,
            y: this.y
          },
          offsetVector: {
            x: evt.stageX - this.x,
            y: evt.stageY - this.y
          },
          clickVector: {
            x: evt.stageX,
            y: evt.stageY
          },
          width: this.w
        };
      } else if(evt.nativeEvent.button === 2){ //RIGHT CLICK

      }
    });

    this.rectangle.on("mouseup", (evt) => {
      console.log("mousedown", evt);
      this.state = "DEFAULT";
    });

    this.rectangle.on("pressmove", (evt) => {
      //console.log("pressmove", evt);
      switch(this.state){
        case "TRANSLATE":
          this.x = evt.stageX - this.original.offsetVector.x;
          this.y = evt.stageY - this.original.offsetVector.y;
          break;
        case "ROTATE":
          let vec = {
            x: evt.stageX - this.original.centerVector.x,
            y: evt.stageY - this.original.centerVector.y
          };
          let theta = degrees(Math.atan2(vec.y, vec.x));
          this.rotation = theta;
          break;
        case "SCALE":
          vec = {
            x: evt.stageX - this.original.centerVector.x,
            y: evt.stageY - this.original.centerVector.y
          };
          //aspect ratio determined by y/x of vec
          let aspect = vec.y / vec.x;
          //amount to scale determined by dividing magnitude
          let newWidth =  this.original.width * (Math.hypot(vec.x, vec.y) /
                                  Math.hypot(this.original.offsetVector.x, this.original.offsetVector.y));


          this.w = newWidth;
          this.h = aspect * newWidth;
          // console.log(
          //   bounding_box(
          //     {x: this.container.x, y: this.container.y},
          //     {w: this.w, h: this.h},
          //     this.rectangle.rotation,
          //     this.rectangle.scaleX,
          //     this.rectangle.scaleY
          //   )
          // );
          break;
      }
      this.environment.setState({
        update: true
      });
    });
  }
}


function degrees(radians: number){
  return radians / Math.PI * 180;
}

function radians(degrees: number){
  return degrees / 180 * Math.PI;
}

function bounding_box(center, dims, rotation, scaleX, scaleY){
  let xformed = xform(center, dims, rotation, scaleX, scaleY);
  let x1= xformed.map((p) => p.x).reduce((a, b)=> a < b? a: b);
  let y1= xformed.map((p) => p.y).reduce((a, b)=> a < b? a: b);
  let x2= xformed.map((p) => p.x).reduce((a, b)=> a > b? a: b);
  let y2= xformed.map((p) => p.y).reduce((a, b)=> a > b? a: b);
  return {
    x: x1, y: y1, w: x2-x1, h: y2-y1
  };
}

//transforms rotated and scaled coords back to original coords
function xformToCanvas({x: x0, y: y0}, {x, y}, rotation, scaleX, scaleY){
  x *= scaleX;
  y *= scaleY;
  return {
    x: x0 + x*Math.cos(radians(rotation))+ y*Math.sin(radians(rotation)),
    y: y0 + x*Math.sin(radians(rotation))+ y*Math.cos(radians(rotation))
  };
}
