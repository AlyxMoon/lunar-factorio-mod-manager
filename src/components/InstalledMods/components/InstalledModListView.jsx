import React from 'react'
import {Table} from 'react-bootstrap'

export const InstalledModListView = React.createClass({
  render () {
    let {installedMods, selectedInstalledMod, setSelectedInstalledMod} = this.props
    return (
      <div className='installedModsList'>
        <Table hover condensed bordered responsive>
          <thead>
            <tr className='bg-primary'>
              <th colSpan='2'>All Installed Mods</th>
            </tr>
          </thead>
          <tbody>
            {installedMods.map((mod, key) => (
              <tr key={key} className='installedModListEntry'>
                <td
                  className={'setSelectedInstalledMod ' + (key === selectedInstalledMod ? 'bg-success' : '')}
                  onClick={() => setSelectedInstalledMod(key)} >
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
