import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {connect} from 'react-redux'
import {List, Map} from 'immutable'
import {Grid, Row, Col} from 'react-bootstrap'

import * as actionCreators from '../../action_creators'
import {ProfileDetailedView} from './components/ProfileDetailedView'
import {ProfileListView} from './components/ProfileListView'

require('./style.scss')

export const Profiles = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps () {
    return {
      profiles: List.of(Map()),
      activeProfile: 0,
      addProfile: () => {},
      renameProfile: () => {},
      moveProfileUp: () => {},
      moveProfileDown: () => {},
      deleteProfile: () => {},
      setActiveProfile: () => {},
      toggleModStatus: () => {}
    }
  },

  render () {
    return (
      <Grid bsClass='container-fluid' className='profiles'>
        <Row>
          <Col xs={6} md={4}>
            <ProfileListView
              profiles={this.props.profiles}
              activeProfile={this.props.activeProfile}
              addProfile={this.props.addProfile}
              renameProfile={this.props.renameProfile}
              moveProfileUp={this.props.moveProfileUp}
              moveProfileDown={this.props.moveProfileDown}
              deleteProfile={this.props.deleteProfile}
              setActiveProfile={this.props.setActiveProfile}
            />
          </Col>
          <Col xs={6} md={8}>
            <ProfileDetailedView
              profile={this.props.profiles.get(this.props.activeProfile)}
              activeProfile={this.props.activeProfile}
              toggleModStatus={this.props.toggleModStatus}
            />
          </Col>
        </Row>
      </Grid>
    )
  }
})

function mapStateToProps (state) {
  return {
    profiles: state.get('profiles'),
    activeProfile: state.get('activeProfile')
  }
}

export const ProfilesContainer = connect(
  mapStateToProps,
  actionCreators
)(Profiles)
