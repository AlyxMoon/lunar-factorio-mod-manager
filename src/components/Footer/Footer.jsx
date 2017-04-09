import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'
import {Grid, Row, Col} from 'react-bootstrap'

import * as actionCreators from '../../action_creators'

require('./style.scss')

export const Footer = React.createClass({
  mixins: [PureRenderMixin],

  getPlayerLoginMessage () {
    if (this.props.playerName) {
      return `You are logged in as: ${this.props.playerName}`
    } else {
      return 'Was not able to find player login info. You will not be able to download mods'
    }
  },

  getOnlineModsFetchedMessage () {
    if (!this.props.onlineModsFetchedCount || !this.props.totalOnlineMods) {
      return 'No Online Mods Found'
    } else {
      if (this.props.onlineModsFetchedCount === this.props.totalOnlineMods) {
        return 'All Mods Fetched'
      } else {
        const result = this.props.onlineModsFetchedCount / this.props.totalOnlineMods * 100
        return `Mods Fetched -- ${result.toFixed(2)}%`
      }
    }
  },

  render () {
    return (
      <div className='footer'>
        <hr />
        <Grid bsClass='container-fluid'>
          <Row>
            <Col
              xs={4} sm={3} md={2} lg={2}
              title={this.getPlayerLoginMessage()}
              className='playerName'>
              {this.props.playerName ? 'Logged In' : 'Not Logged In'}
            </Col>
            <Col
              xs={5} sm={4} md={3} lg={2}
              className='modFetchStatus'>
              {this.getOnlineModsFetchedMessage()}
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
})

function mapStateToProps (state) {
  return {
    playerName: state.get('playerName'),
    totalOnlineMods: state.get('onlineModsCount', 1),
    onlineModsFetchedCount: state.get('onlineModsFetchedCount')
  }
}

export const FooterContainer = connect(
  mapStateToProps,
  actionCreators
)(Footer)
