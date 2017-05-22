import React from 'react'
import {Table} from 'react-bootstrap'

export const InstalledModListView = React.createClass({
  updateAllInstalledMods () {
    this.props.installedMods.forEach(mod => {
      if (mod.has('latestAvailableUpdate')) {
        let name = mod.get('name')
        let link = mod.getIn(['latestAvailableUpdate', 'download_url'])
        this.props.requestDownload(name, link)
      }
    })
  },

  render () {
    let {installedMods, selectedInstalledMod, setSelectedInstalledMod, requestDownloadMissingDependencies} = this.props
    return (
      <div className='installedModsList'>
        <Table hover condensed bordered responsive>
          <thead>
            <tr className='bg-primary'>
              <th colSpan='2'>
                <span
                  title='Update All Installed Mods'
                  className='updateAllInstalledMods'
                  onClick={this.updateAllInstalledMods} >
                  <i className='glyphicon glyphicon-download-alt' />
                </span>
                <span
                  title='Download Any Missing Required Dependencies'
                  className='downloadMissingDependencies'
                  onClick={requestDownloadMissingDependencies} >
                  <i className='glyphicon glyphicon-warning-sign' />
                </span>
                All Installed Mods
              </th>
            </tr>
          </thead>
          <tbody>
            {installedMods.map((mod, key) => (
              <tr key={key} className='installedModListEntry'>
                <td
                  className={'setSelectedInstalledMod ' + (key === selectedInstalledMod ? 'bg-success' : '')}
                  onClick={() => setSelectedInstalledMod(key)} >
                  {mod.has('missingDependencies') &&
                  <i title='Missing Dependencies' className='glyphicon glyphicon-warning-sign missingDependencyIndicator' /> }
                  {mod.has('latestAvailableUpdate') &&
                  <i title='Update Available' className='glyphicon glyphicon-info-sign updateIndicator' /> }
                  {mod.get('name')}
                  <span className='installedModListEntryVersion'>
                    {mod.get('version')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    )
  }
})
