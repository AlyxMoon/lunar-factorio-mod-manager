import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {Grid, Row, Col, Table} from 'react-bootstrap'
import {connect} from 'react-redux'
import {List, Map} from 'immutable'

import * as actionCreators from '../../action_creators'

require('./style.scss')

export const Saves = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps () {
    return {
      saves: List.of(Map()),
      activeSave: 0,
      setActiveSave: () => {}
    }
  },

  render () {
    let {saves, activeSave, setActiveSave} = this.props
    return (
      <Grid bsClass='container-fluid' className='saves'>
        <Row>
          <Col xs={6} md={4}>
            <div className='savesList'>
              <Table condensed bordered responsive>
                <thead>
                  <tr className='bg-primary'>
                    <th>
                      Saves
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {saves && saves.map((save, key) => (
                    <tr key={key} className='saveListEntry'>
                      <td
                        className={'clickable ' + (key === activeSave ? 'bg-success' : '')}
                        onClick={() => { setActiveSave(key) }} >
                        {save.get('name')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
          <Col xs={6} md={8}>
            <div className='savesDetailedView'>
              {saves.has(activeSave) ? (
                <Table condensed bordered responsive>
                  <thead>
                    <tr className='bg-primary'>
                      <th colSpan='2'>{saves.getIn([activeSave, 'name'])}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saves.getIn([activeSave, 'mods']).map((mod, modIndex) => (
                      <tr
                        key={modIndex}
                        className='activeSaveModListEntry' >
                        <td>{mod.get('name')}</td>
                        <td>{mod.get('version')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : ''}
            </div>
          </Col>
        </Row>
      </Grid>
    )
  }
})

function mapStateToProps (state) {
  return {
    saves: state.get('saves'),
    activeSave: state.get('activeSave')
  }
}

export const SavesContainer = connect(
  mapStateToProps,
  actionCreators
)(Saves)
