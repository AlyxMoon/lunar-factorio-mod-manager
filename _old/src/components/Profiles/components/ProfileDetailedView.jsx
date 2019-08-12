import React from 'react'
import {Table} from 'react-bootstrap'
import createReactClass from 'create-react-class'

export const ProfileDetailedView = createReactClass({
  render () {
    return (
      <div className='activeProfileDetails'>
        <Table condensed bordered responsive>
          <thead>
            <tr className='bg-primary'>
              <th className='activeProfileName'>{this.props.profile.get('name')}</th>
            </tr>
          </thead>
          <tbody>
            {this.props.profile.has('mods') && this.props.profile.get('mods').map((mod, key) => (
              <tr key={key} className='activeProfileModListEntry'>
                <td className={mod.get('enabled') === 'true' ? 'bg-success' : 'bg-danger'}>
                  {mod.get('name')}
                  <span
                    title='Toggle Mod Status'
                    className='toggleModStatus'
                    onClick={() => this.props.toggleModStatus(this.props.activeProfile, key)} >
                    {mod.get('enabled') === 'true' ? 'enabled' : 'disabled'}
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
