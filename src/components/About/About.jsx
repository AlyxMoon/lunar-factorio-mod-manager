import React from 'react'
import {connect} from 'react-redux'
import {Grid, Row, Col} from 'react-bootstrap'

import * as actionCreators from '../../action_creators'

require('./style.scss')

export const About = React.createClass({
  getDefaultProps () {
    return {
      appCurrentVersion: '0.0.0',
      appLatestVersion: '0.0.0'
    }
  },

  handleLink (e, link) {
    e.preventDefault()
    this.props.openExternalLink(link)
  },

  render () {
    return (
      <Grid bsClass='container-fluid' className='about'>
        <div className='view1'>
          <Row>
            <Col xs={5} sm={4} md={2} lg={2}>
              <img src='./img/logo.svg' className='img-logo' />
            </Col>
            <Col xs={7} sm={8} md={10} lg={10}>
              <h3>Lunar's Factorio Mod Manager</h3>
              <h4>By: Allister Moon</h4>
              <hr />
              <h4 className='appCurrentVersion'>Version: {this.props.appCurrentVersion}</h4>
              <h5
                className='externalLink appLatestVersion'
                onClick={e => this.handleLink(e, 'https://github.com/AlyxMoon/Lunars-Factorio-Mod-Manager/releases/latest')}>
                Latest Release Version: {this.props.appLatestVersion}
              </h5>
              <hr />
            </Col>
          </Row>
        </div>
        <div className='view2'>
          <Row>
            <Col xs={12}>
              <h4>About LMM</h4>
              <p>This is geared towards both modders and casual users alike. I want people like me (who end up using many mod configurations and messing with them on a regular basis) to easily manage mods. So you can spend less time managing mods and focus on the important part: playing with them.</p>

              <h4>Helpful Links</h4>
              <p
                className='externalLink'
                onClick={e => this.handleLink(e, 'https://mods.factorio.com')}>
                Official Mod Portal (Unaffiliated with this app)
              </p>
              <p
                className='externalLink'
                onClick={e => this.handleLink(e, 'https://forums.factorio.com/viewtopic.php?f=137&t=30394')}>
                Check it out on the Factorio Forums
              </p>
              <p
                className='externalLink'
                onClick={e => this.handleLink(e, 'https://github.com/AlyxMoon/Lunars-Factorio-Mod-Manager')}>
                Check out the Github Repo
              </p>
              <p
                className='externalLink'
                onClick={e => this.handleLink(e, 'https://github.com/AlyxMoon/Lunars-Factorio-Mod-Manager/issues/new')}>
                Report an issue on the Github Repo
              </p>

              <h4>Legal Stuff</h4>
              <p>Copyright (c) 2016, Allister Moon</p>
              <p>Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.</p>
              <p>THE SOFTWARE IS PROVIDED 'AS IS' AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.</p>
            </Col>
          </Row>
        </div>
      </Grid>
    )
  }
})

function mapStateToProps (state) {
  return {
    appCurrentVersion: state.get('appCurrentVersion'),
    appLatestVersion: state.get('appLatestVersion')
  }
}

export const AboutContainer = connect(
  mapStateToProps,
  actionCreators
)(About)
