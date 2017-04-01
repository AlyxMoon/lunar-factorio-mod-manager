import React from 'react'
import {Table} from 'react-bootstrap'

export const OnlineModListView = React.createClass({
  render () {
    let {onlineMods, selectedOnlineMod, setSelectedOnlineMod} = this.props
    return (
      <div className='onlineModsList'>
        <Table hover condensed bordered responsive>
          <thead>
            <tr className='bg-primary'>
              <th colSpan='2'>All Online Mods</th>
            </tr>
          </thead>
          <tbody>
            {onlineMods.map((mod, key) => (
              <tr key={key} className='onlineModListEntry'>
                <td
                  title={mod.get('summary', '')}
                  className={'setSelectedOnlineMod ' + (key === selectedOnlineMod.get(0) ? 'bg-success' : '')}
                  onClick={() => setSelectedOnlineMod(key, 0)}
                  >
                  {mod.get('name')}
                  <span title='Latest Version Available' className='onlineModListEntryLatestVersion'>
                    {mod.getIn(['releases', 0, 'version'])}
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
