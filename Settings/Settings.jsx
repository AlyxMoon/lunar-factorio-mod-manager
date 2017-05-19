import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'

import * as actionCreators from '../../action_creators'

export const Settings = React.createClass({
  mixins: [PureRenderMixin],

  render () {
    return (
      <div className='settings'>
        Settings!
      </div>
    )
  }
})

function mapStateToProps (state) {
  return {
  }
}

export const SettingsContainer = connect(
  mapStateToProps,
  actionCreators
)(Settings)
