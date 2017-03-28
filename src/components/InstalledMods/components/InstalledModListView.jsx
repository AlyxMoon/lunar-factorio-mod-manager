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
