import React from 'react'
import {Table} from 'react-bootstrap'

export const ProfileListView = React.createClass({
  render () {
    return (
      <div className='profileList'>
        <Table condensed bordered responsive>
          <thead>
            <tr className='bg-primary'>
              <th>
                <span
                  title='Add New Profile'
                  className='addProfile'
                  onClick={this.props.addProfile} >
                  <i className='glyphicon glyphicon-plus' />
                </span>
                Profiles
              </th>
            </tr>
          </thead>
          <tbody>
            {this.props.profiles && this.props.profiles.map((profile, key) => (
              <tr key={key} className='profileListEntry'>
                <td>
                  <input
                    title='Activate Profile'
                    type='radio'
                    className='setActiveProfile'
                    checked={key === this.props.activeProfile}
                    onChange={() => this.props.setActiveProfile(key)}
                  />
                  <input
                    type='text'
                    className='renameProfile'
                    value={profile.get('name')}
                    onChange={e => this.props.renameProfile(key, e.target.value)}
                  />
                  <span className='profileListEntryOptions'>
                    {key !== 0 &&
                      <i
                        title='Move Up'
                        className='moveProfileUp glyphicon glyphicon-arrow-up'
                        onClick={() => this.props.moveProfileUp(key)} /> }
                    {key < this.props.profiles.size - 1 &&
                      <i
                        title='Move Down'
                        className='moveProfileDown glyphicon glyphicon-arrow-down'
                        onClick={() => this.props.moveProfileDown(key)} /> }
                    <i
                      title='Delete'
                      className='deleteProfile text-danger glyphicon glyphicon-remove'
                      onClick={() => this.props.deleteProfile(key)} />
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
