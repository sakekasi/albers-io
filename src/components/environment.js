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
      container: new createjs.Container()
    }
  }

  render(): React.Component {
    let horizontalMargin = ($('body').width() - this.props.width) / 2;
    let verticalMargin = ($('body').height() - this.props.height) / 2;
    let style = {left: horizontalMargin, top: verticalMargin};
    return (
      <canvas ref="canvas" style={style}
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
      this.state.container.addChild(s.container);
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
      this.state.container.addChild(shapes.get(key).container);
    });
    removed.forEach((_, key) => {
      this.state.container.removeChild(shapes.get(key).container);
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
  rectangle: createjs.Shape;
  state: string;
  offset: ?object;
  center: ?object;
  origClick: ?object;
  container: ?object;

  constructor(rect){
    super(rect.x, rect.y, rect.w, rect.h, rect.color);

    this.state = "DEFAULT";
    this.offset = null;
    this.center = null;
    this.origClick = null;

    this.container = new createjs.Container();
    this.rectangle = new createjs.Shape();
    this.container.addChild(this.rectangle);

    this.rectangle.graphics.beginFill(this.color.hex()).drawRect(-this.w/2, -this.h/2, this.w, this.h).endFill();

    //don't know how sensible it is to maintain parallel variables
    this.container.x = this.x;
    this.container.y = this.y;
    this.rectangle.scaleX = this.rectangle.scaleY = this.scale;
    this.rectangle.rotation = this.rotation;

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
            x: this.container.x,
            y: this.container.y
          },
          offsetVector: {
            x: evt.stageX - this.container.x,
            y: evt.stageY - this.container.y
          },
          clickVector: {
            x: evt.stageX,
            y: evt.stageY
          },
          scaleMagnitude: this.rectangle.scaleX
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
          this.container.x = this.x = evt.stageX - this.original.offsetVector.x;
          this.container.y = this.y = evt.stageY - this.original.offsetVector.y;
          update = true;
          break;
        case "ROTATE":
          let vec = {
            x: evt.stageX - this.original.centerVector.x,
            y: evt.stageY - this.original.centerVector.y
          };
          let theta = degrees(Math.atan2(vec.y, vec.x));
          this.rectangle.rotation = this.rotation = theta;
          update = true;
          break;
        case "SCALE":
          vec = {
            x: evt.stageX - this.original.centerVector.x,
            y: evt.stageY - this.original.centerVector.y
          };
          //aspect ratio determined by y/x of vec
          let aspect = vec.y / vec.x; //wrong behaviour
          //amount to scale determined by dividing magnitude
          let scaleMagnitude =  this.original.scaleMagnitude * (Math.hypot(vec.x, vec.y) /
                                Math.hypot(this.original.offsetVector.x, this.original.offsetVector.y));


          this.rectangle.scaleX = scaleMagnitude;
          this.rectangle.scaleY = aspect * scaleMagnitude;
          // console.log({x: this.container.x, y: this.container.y}, this.rectangle.rotation);
          console.log(
            bounding_box(
              {x: this.container.x, y: this.container.y},
              {w: this.w, h: this.h},
              this.rectangle.rotation,
              this.rectangle.scaleX,
              this.rectangle.scaleY
            )
          );
          // console.log(this.rectangle.getBounds());
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
