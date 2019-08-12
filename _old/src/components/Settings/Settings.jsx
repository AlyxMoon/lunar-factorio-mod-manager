import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'
import {Map} from 'immutable'
import createReactClass from 'create-react-class'

import * as actionCreators from '../../action_creators'

require('./style.scss')

export const Settings = createReactClass({
  mixins: [PureRenderMixin],

  getDefaultProps () {
    return {
      settings: Map()
    }
  },

  render () {
    let {settings, changeAppSetting} = this.props
    return (
      <div className='settings'>
        <div className='panel panel-info'>
          <div className='panel-heading'>
            <h3 className='panel-title'>Mod Settings</h3>
          </div>
          <div className='panel-body'>
            <div className='checkbox'>
              <label>
                <input
                  type='checkbox'
                  checked={settings.get('automatically_poll_online_mods', false)}
                  onChange={e => { changeAppSetting('automatically_poll_online_mods', e.target.checked) }} />
                Fetch online mods on app start
              </label>
              <span className='help-block'>When enabled, the app will automatically start checking for online mods from the Factorio mods portal on start. Otherwise, will only do so when the 'check online mods' button is clicked.</span>
            </div>
            <div className='checkbox'>
              <label>
                <input
                  type='checkbox'
                  checked={settings.get('automatically_update_installed_mods', false)}
                  onChange={e => { changeAppSetting('automatically_update_installed_mods', e.target.checked) }} />
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
    settings: state.get('settings', Map())
  }
}

export const SettingsContainer = connect(
  mapStateToProps,
  actionCreators
)(Settings)
