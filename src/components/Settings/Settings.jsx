import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'

import * as actionCreators from '../../action_creators'

require('./style.scss')

export const Settings = React.createClass({
  mixins: [PureRenderMixin],

  render () {
    return (
      <div className='settings'>
        <div className='panel panel-info'>
          <div className='panel-heading'>
            <h3 className='panel-title'>Mod Settings</h3>
          </div>
          <div className='panel-body'>
            <div className='checkbox'>
              <label>
                <input type='checkbox' value='true' />
                Fetch online mods on app start
              </label>
              <span className='help-block'>When enabled, the app will automatically start checking for online mods from the Factorio mods portal on start. Otherwise, will only do so when the 'check online mods' button is clicked.</span>
            </div>
            <div className='checkbox'>
              <label>
                <input type='checkbox' value='' />
                Automatically update mods
              </label>
              <span className='help-block'>When enabled, installed mods will be automatically updated if a compatible later version is found on the Factorio mod portal.</span>
            </div>
          </div>
        </div>
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
