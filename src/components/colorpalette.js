import React from 'react';
import chroma from 'chroma-js';
import $ from 'jquery';
import { List } from 'immutable';

export default class ColorPallete extends React.Component {
  propTypes: {
    source: React.PropTypes.string.isRequired,
    pickColor: React.PropTypes.func.isRequired,
  }

  constructor(){
    super();
    this.state = {
      colors: new List()
    }
  }

  componentDidMount(){
    $.ajax({
      url: this.props.source,
      dataType: 'json',
    }).then((data) => {
      let numSwatches = Math.ceil(this.props.height / 50) * Math.ceil(this.props.width / 50); //50 is hardcoded at the moment. represents width of swatch

      let colors = new List(data.colors);
      colors = colors.map((c) => chroma(...c));
      colors = colors.slice(0, numSwatches);
      this.setState({colors});
    }, (jqXHR, textStatus, errorThrown) => {
      console.error(textStatus);
    });
  }

  render(){
    let children = this.state.colors.map((c, i) => <ColorSwatch color={c}
                                                     key={i}floor
                                                     pickColor={this.props.pickColor}/>);
    let style = {width: Math.ceil(this.props.width / 50) * 50};
    return (
      <div className="palette" style={style}>
        {children}
      </div>
    )
  }
}

class ColorSwatch extends React.Component {
  // propTypes: {
  //   pickColor: React.PropTypes.func.isRequired,
  //   color: React.PropTypes.instanceOf(Color),
  // }

  render(){
    return <div className="swatch" style={{
      backgroundColor: this.props.color.hex(),//css('hsl'),
      display: 'inline-block',
      width: '50px',
      height: '50px'
    }} onClick={this.handleClick.bind(this)}/>;
  }

  handleClick(){
    this.props.pickColor(this.props.color);
  }
}
