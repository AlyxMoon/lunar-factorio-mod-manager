import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'
import {List, Map} from 'immutable'
import {Grid, Row, Col} from 'react-bootstrap'

import * as actionCreators from '../../action_creators'
import {getSortedMods, getFilteredMods} from '../../onlineMods'
import {OnlineModListView} from './components/OnlineModListView'
import {OnlineModDetailedView} from './components/OnlineModDetailedView'

require('./style.scss')

export const OnlineMods = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps () {
    return {
      onlineMods: List.of(Map()),
      selectedOnlineMod: List.of(0, 0),
      filterBy: List(),
      sortBy: List.of('name', 'ascending'),
      setSelectedOnlineMod: () => {},
      requestDownload: () => {},
      setOnlineModSort: () => {},
      setOnlineModFilter: () => {}
    }
  },

  render () {
    return (
      <Grid bsClass='container-fluid' className='onlineMods'>
        <Row>
          <Col xs={6} md={4}>
            <OnlineModListView
              onlineMods={this.props.onlineMods}
              selectedOnlineMod={this.props.selectedOnlineMod}
              filterBy={this.props.filterBy}
              sortBy={this.props.sortBy}
              setSelectedOnlineMod={this.props.setSelectedOnlineMod}
              setOnlineModSort={this.props.setOnlineModSort}
              setOnlineModFilter={this.props.setOnlineModFilter}
            />
          </Col>
          <Col xs={6} md={8}>
            <OnlineModDetailedView
              mod={this.props.onlineMods.get(this.props.selectedOnlineMod.get(0))}
              selectedOnlineMod={this.props.selectedOnlineMod}
              setSelectedOnlineMod={this.props.setSelectedOnlineMod}
              requestDownload={this.props.requestDownload}
            />
          </Col>
        </Row>
      </Grid>
    )
  }
})

function mapStateToProps (state) {
  return {
    onlineMods: getSortedMods(getFilteredMods(state), state.get('onlineModSort')),
    selectedOnlineMod: state.get('selectedOnlineMod'),
    filterBy: state.get('onlineModFilters'),
    sortBy: state.get('onlineModSort')
  }
}

export const OnlineModsContainer = connect(
  mapStateToProps,
  actionCreators
)(OnlineMods)
