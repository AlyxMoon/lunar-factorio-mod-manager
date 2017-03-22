import React from 'react'
import {BrowserRouter} from 'react-router-dom'

export default React.createClass({
  render: function() {
    return (
      <BrowserRouter>
        <div>
          {this.props.children}
        </div>
      </BrowserRouter>
    )
  }
})