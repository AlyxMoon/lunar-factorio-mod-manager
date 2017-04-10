import React from 'react'
import {List} from 'immutable'

export const OnlineModDetailedView = React.createClass({
  // So that anchor elements in description_html work as standard in the app
  onClick (e) {
    e.preventDefault()
    if (e.target.tagName === 'A') this.props.openExternalLink(e.target.href)
  },

  sendDownloadRequest () {
    let name = this.props.mod.get('name')
    let link = this.props.mod.getIn(['releases', this.props.selectedOnlineMod.get(1), 'download_url'])
    this.props.requestDownload(name, link)
  },

  render () {
    let {mod, selectedOnlineMod, setSelectedOnlineMod} = this.props
    return (
      <div className='OnlineModDetailedView'>
        {mod ? (
          <div className='panel panel-primary'>
            <div className='panel-heading'>
              <span
                title='Download Mod'
                className='requestDownload'
                onClick={this.sendDownloadRequest} >
                <i className='glyphicon glyphicon-download-alt' />
              </span>
              <span className='selectedOnlineModName'>{mod.get('title')}</span>
            </div>
            <div className='panel-body'>
              <strong>Version</strong>
              <select className='selectedOnlineModVersionsList'>
                {mod.get('releases', List()).map((release, key) => (
                  <option
                    key={key}
                    onClick={() => setSelectedOnlineMod(selectedOnlineMod.get(0), key)} >
                    {release.get('version')}
                  </option>
                ))}
              </select>
              <br />

              <strong>Factorio Version</strong>
              <p className='selectedOnlineModFactorioVersion'>{mod.getIn(['releases', selectedOnlineMod.get(1), 'factorio_version'])}</p>

              <strong>Total Downloads</strong>
              <p className='selectedOnlineModDownloads'>{mod.get('downloads_count')}</p>

              <strong>Owner</strong>
              <p className='selectedOnlineModOwner'>{mod.get('owner')}</p>

              <strong>Homepage</strong>
              <p className='selectedOnlineModHomepage'>{mod.get('homepage')}</p>

              <hr />
              <span onClick={this.onClick} className='selectedOnlineModDescription' dangerouslySetInnerHTML={{__html: mod.get('description_html')}} />
            </div>
          </div>) : ''}
      </div>
    )
  }
})
