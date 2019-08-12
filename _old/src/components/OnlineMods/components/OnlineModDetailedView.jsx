import React from 'react'
import {List} from 'immutable'
import createReactClass from 'create-react-class'

export const OnlineModDetailedView = createReactClass({
  // So that anchor elements in description_html work as standard in the app
  onClick (e) {
    e.preventDefault()
    if (e.target.tagName === 'A') this.props.openExternalLink(e.target.href)
  },

  sendDownloadRequest () {
    let releaseNum = this.props.selectedOnlineMod.get(1)
    if (releaseNum > this.props.mod.get('releases').size) releaseNum = 0

    let name = this.props.mod.get('name')
    let link = this.props.mod.getIn(['releases', releaseNum, 'download_url'])
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
              <select
                className='selectedOnlineModVersionsList'
                onChange={e => { setSelectedOnlineMod(selectedOnlineMod.get(0), Number(e.target.value)) }} >
                {mod.get('releases', List()).map((release, key) => (
                  <option
                    key={key}
                    value={key} >
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
