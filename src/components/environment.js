import React from 'react';
import ReactDOM from 'react-dom';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List, Map } from 'immutable';

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
      container: new createjs.Container()
    }
  }

  render(): React.Component {
    return (
      <canvas ref="canvas"
              onKeyDown={this.keyDown.bind(this)}
              onKeyUp={this.keyUp.bind(this)}
              width={this.props.width}
              height={this.props.height}></canvas>
    );
  }

  keyDown(event){
    console.log(e.type, e.which, e.timeStamp);
  }

  keyUp(event){
    console.log(e.type, e.which, e.timeStamp);
  }

  componentDidMount(){
    let canvas = ReactDOM.findDOMNode(this.refs.canvas);
    let stage = new createjs.Stage(canvas);
    createjs.Touch.enable(stage);
    stage.addChild(this.state.container);

    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true;


    let shapes = this.props.rectangles.map(rect => new EaselRectangle(rect));
    shapes.forEach(s => {
      this.state.container.addChild(s.shape);
      // s.shape.cache();
    });

    update = true;
    createjs.Ticker.addEventListener("tick", this.tick.bind(this));
    this.setState({
      stage, shapes
    });
  }

  componentWillReceiveProps(nextProps){
    let added, removed;
    added = nextProps.rectangles.filter((_, key) => !this.state.shapes.has(key));
    removed = this.state.shapes.filter((_, key) => !nextProps.rectangles.has(key));

    let shapes = this.state.shapes.merge(
      added.map(rect => new EaselRectangle(rect))
    );

    added.forEach((_, key) => {
      this.state.container.addChild(shapes.get(key).shape);
    });
    removed.forEach((_, key) => {
      this.state.container.removeChild(shapes.get(key).shape);
      shapes = shapes.delete(key);
    });

    update = true;
    this.setState({
      shapes
    });
  }

  shouldComponentUpdate(nextProps, nextState){
    return false; //TODO; doublecheck this
  }

  tick(event){
    if(update){
      update = false;
      this.state.stage.update();
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
    this.rotation = 0;//Math.random()*50-25;
  }

}

class EaselRectangle extends Rectangle { //outside folks don't know about this one
  shape: createjs.Shape;
  state: string;
  offset: ?object;
  center: ?object;
  origClick: ?object;
  //default, translate, rotate, scale

  constructor(rect){
    super(rect.x, rect.y, rect.w, rect.h, rect.color);

    this.state = "DEFAULT";
    this.offset = null;
    this.center = null;
    this.origClick = null;

    this.shape = new createjs.Shape();

    this.shape.graphics.beginFill(this.color.hex()).drawRect(-this.w/2, -this.h/2, this.w, this.h).endFill();

    this.shape.x = this.x;
    this.shape.y = this.y;
    this.shape.scaleX = this.shape.scaleY = this.scale;
    this.shape.rotation = this.rotation;

    this.shape.on("mousedown", (evt) => {
      console.log("mousedown", evt);
      if(evt.nativeEvent.button === 0){ //LEFT CLICK
        if(evt.nativeEvent.shiftKey){
          this.state = "ROTATE";
        } else if(evt.nativeEvent.ctrlKey){
          this.state = "SCALE";
        } else {
          this.state = "TRANSLATE";
        }

        this.center = {x: this.shape.x,
                       y: this.shape.y}
        this.offset = {x: evt.stageX - this.shape.x, y: evt.stageY - this.shape.y};
        this.origClick = {x: evt.stageX, y: evt.stageY};
      } else if(evt.nativeEvent.button === 2){ //RIGHT CLICK

      }
    });

    this.shape.on("mouseup", (evt) => {
      console.log("mousedown", evt);
      this.state = "DEFAULT";
    });

    this.shape.on("pressmove", (evt) => {
      //console.log("pressmove", evt);
      switch(this.state){
        case "TRANSLATE":
          this.shape.x = this.x = evt.stageX - this.offset.x;
          this.shape.y = this.y = evt.stageY - this.offset.y;
          update = true;
          break;
        case "ROTATE":
          let vec = {
            x: evt.stageX - this.center.x, //this is wrong. we need the rectangle's "center"
            y: evt.stageY - this.center.y
          };
          let theta = (Math.atan2(vec.y, vec.x) /*- Math.PI/2*/ ) * 360 / (2*Math.PI);
          console.log(theta, vec.x, vec.y);
          this.shape.rotation = this.rotation = theta;
          update = true;
          break;
        case "SCALE":
          vec = {
            x: evt.stageX - this.center.x,
            y: evt.stageY - this.center.y
          };
          //aspect ratio determined by y/x of vec
          let aspect = vec.y / vec.x; //wrong behaviour
          //amount to scale determined by dividing magnitude
          let scaleMagnitude = Math.hypot(vec.x, vec.y) / Math.hypot(this.offset.x, this.offset.y);


          this.shape.scaleX = scaleMagnitude;
          this.shape.scaleY = aspect * scaleMagnitude;
          update=true;
          break;
      }
    });
  }
}


function degrees(radians: number){
  return radians / Math.PI * 180;
}

function radians(degrees: number){
  return degrees / 180 * Math.PI;
}
