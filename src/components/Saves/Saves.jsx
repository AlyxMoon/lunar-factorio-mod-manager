import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'
import {List, Map, fromJS} from 'immutable'

import * as actionCreators from '../../action_creators'

require('./style.scss')

export const Saves = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps () {
    return {
      saves: List.of(Map())
    }
  },

  render () {
    return (
      <div className='saves'>
        {this.props.saves.map((save, key) => (
          <span>
            <h3>{save.get('name')}</h3>
            <ul>
              {save.get('mods').map((mod, key1) => (
                <li key={key1}>{mod.get('name')} -- {mod.get('version')}</li>
              ))}
            </ul>
          </span>
        ))}
      </div>
    )
  }
})

function mapStateToProps (state) {
  return {
    saves: fromJS(state.get('saves'))
  }
}

export const SavesContainer = connect(
  mapStateToProps,
  actionCreators
)(Saves)
