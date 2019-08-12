import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'
import {List, Map} from 'immutable'
import {Container, Row, Col} from 'react-bootstrap'
import createReactClass from 'create-react-class'

import * as actionCreators from '../../action_creators'
import {InstalledModListView} from './components/InstalledModListView'
import {InstalledModDetailedView} from './components/InstalledModDetailedView'

require('./style.scss')

export const InstalledMods = createReactClass({
  mixins: [PureRenderMixin],

  getDefaultProps () {
    return {
      installedMods: List.of(Map()),
      selectedInstalledMod: 0,
      setSelectedInstalledMod: () => {},
      deleteInstalledMod: () => {},
      requestDownload: () => {},
      requestDownloadMissingDependencies: () => {}
    }
  },

  render () {
    return (
      <Container bsClass='container-fluid' className='installedMods'>
        <Row>
          <Col xs={6} md={4}>
            <InstalledModListView
              installedMods={this.props.installedMods}
              selectedInstalledMod={this.props.selectedInstalledMod}
              setSelectedInstalledMod={this.props.setSelectedInstalledMod}
              requestDownload={this.props.requestDownload}
              requestDownloadMissingDependencies={this.props.requestDownloadMissingDependencies}
            />
          </Col>
          <Col xs={6} md={8}>
            <InstalledModDetailedView
              mod={this.props.installedMods.get(this.props.selectedInstalledMod)}
              selectedInstalledMod={this.props.selectedInstalledMod}
              deleteInstalledMod={this.props.deleteInstalledMod}
              requestDownload={this.props.requestDownload}
            />
          </Col>
        </Row>
      </Container>
    )
  }
})

function mapStateToProps (state) {
  return {
    installedMods: state.get('installedMods'),
    selectedInstalledMod: state.get('selectedInstalledMod')
  }
}

export const InstalledModsContainer = connect(
  mapStateToProps,
  actionCreators
)(InstalledMods)
