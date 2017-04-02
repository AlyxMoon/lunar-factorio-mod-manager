import React from 'react'
import {List} from 'immutable'
import {Table} from 'react-bootstrap'

export const OnlineModDetailedView = React.createClass({
  sendDownloadRequest () {
    let id = this.props.mod.get('id')
    let link = this.props.mod.getIn(['releases', this.props.selectedOnlineMod.get(1), 'download_url'])
    this.props.requestDownload(id, link)
  },

  render () {
    let {mod, selectedOnlineMod, setSelectedOnlineMod} = this.props
    return (
      <div className='OnlineModDetailedView'>
        {mod ? (
          <Table responsive bordered condensed>
            <thead>
              <tr className='selectedOnlineModName'>
                <th colSpan='2' className='bg-primary'>
                  <span
                    title='Download Mod'
                    className='requestDownload'
                    onClick={this.sendDownloadRequest} >
                    <i className='glyphicon glyphicon-download-alt' />
                  </span>
                  {mod.get('title')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Version</th>
                <td>
                  <select>
                    {mod.get('releases', List()).map((release, key) => (
                      <option
                        key={key}
                        onClick={() => setSelectedOnlineMod(selectedOnlineMod.get(0), key)} >
                        {release.get('version')}
                      </option>
                    ))}
                  </select>

                </td>
              </tr>
              <tr className='selectedOnlineModFactorioVersion'>
                <th>Factorio Version</th>
                <td>{mod.getIn(['releases', selectedOnlineMod.get(1), 'factorio_version'])}</td>
              </tr>
              <tr className='selectedOnlineModDownloads'>
                <th>Total Downloads</th>
                <td>{mod.get('downloads_count')}</td>
              </tr>
              <tr className='selectedOnlineModOwner'>
                <th>Owner</th>
                <td>{mod.get('owner')}</td>
              </tr>
              <tr className='selectedOnlineModOwner'>
                <th>Homepage</th>
                <td>{mod.get('homepage')}</td>
              </tr>
              <tr><th colSpan='2'>Description</th></tr>
              <tr className='selectedOnlineModDescription'>
                <td colSpan='2'>{mod.get('description')}</td>
              </tr>
            </tbody>
          </Table>) : ''}
      </div>
    )
  }
})
