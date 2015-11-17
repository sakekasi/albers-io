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

        this.center = {x: this.container.x,
                       y: this.container.y}
        this.offset = {x: evt.stageX - this.container.x, y: evt.stageY - this.container.y};
        this.origClick = {x: evt.stageX, y: evt.stageY};
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
          this.container.x = this.x = evt.stageX - this.offset.x;
          this.container.y = this.y = evt.stageY - this.offset.y;
          update = true;
          break;
        case "ROTATE":
          let vec = {
            x: evt.stageX - this.center.x, //this is wrong. we need the rectangle's "center"
            y: evt.stageY - this.center.y
          };
          let theta = (Math.atan2(vec.y, vec.x) /*- Math.PI/2*/ ) * 360 / (2*Math.PI);
          console.log(theta, vec.x, vec.y);
          this.rectangle.rotation = this.rotation = theta;
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


          this.rectangle.scaleX = scaleMagnitude;
          this.rectangle.scaleY = aspect * scaleMagnitude;
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
