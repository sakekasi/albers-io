import React from 'react';
import chroma from 'chroma-js';
import jQuery from 'jquery';
import { List } from 'immutable';

export default class ColorPallete extends React.Component {
  propTypes: {
    source: React.PropTypes.string
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
      this.setState({colors});
    }, (jqXHR, textStatus, errorThrown) => {
      console.error(textStatus);
    });
  }

  render(){
    let children = this.state.colors.map((c) => <ColorSwatch color={c}/>);
    return (
      <div className="palette">
        {children}
      </div>
    )
  }
}

class ColorSwatch extends React.Component {
  propTypes: {
    //color: React.PropTypes.instanceOf(chroma);
  }

  render(){
    return <div className="swatch" style={{
      backgroundColor: this.props.color.css('hsl'),
      display: 'inline-block',
      width: '50px',
      height: '50px'
    }}/>
  }
}
