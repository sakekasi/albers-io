import React from 'react';
import chroma from 'chroma-js';
import jQuery from 'jquery';
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
    jQuery.ajax({
      url: this.props.source,
      dataType: 'json',
    }).then((data) => {
      let colors = new List(data.colors);
      colors = colors.map((c) => chroma(...c));
      //colors = colors.filter((a) => a.hcl()[0] !== NaN);
      // colors = colors.filter((a) => a.hcl()[1]
      // colors = colors.sort((a, b) => a.hcl()[0] < b.hcl()[0]);
      this.setState({colors});
    }, (jqXHR, textStatus, errorThrown) => {
      console.error(textStatus);
    });
  }

  render(){
    let children = this.state.colors.map((c) => <ColorSwatch color={c}
                                                   pickColor={this.props.pickColor}/>);
    return (
      <div className="palette">
        {children}
      </div>
    )
  }
}

class ColorSwatch extends React.Component {
  propTypes: {
    pickColor: React.PropTypes.func.isRequired,
    color: React.PropTypes.instanceOf(Color),
  }

  render(){
    return <div className="swatch" style={{
      backgroundColor: this.props.color.hex(),//css('hsl'),
      display: 'inline-block',
      width: '50px',
      height: '50px'
    }} onClick={this.handleClick}/>;
  }

  handleClick(){
    this.props.pickColor(this.props.color);
  }
}
