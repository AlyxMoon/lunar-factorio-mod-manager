import React from 'react'
import {Table, Button} from 'react-bootstrap'
import {List} from 'immutable'

export const InstalledModDetailedView = React.createClass({
  // Some mods only have a single dependency listed as a string instead of an array. This will fix that.
  getDependencyList () {
    const dependencies = this.props.mod.get('dependencies', List())
    return typeof dependencies === 'string' ? List.of(dependencies) : dependencies
  },

  render () {
    let {mod, selectedInstalledMod, deleteInstalledMod} = this.props
    return (
      <div className='installedModDetailedView'>
        {mod ? (
          <Table condensed>
            <thead>
              <tr className='selectedInstalledModName'>
                <th colSpan='2'>
                  {mod.get('name')}
                  <Button
                    bsStyle='danger'
                    className='deleteInstalledMod'
                    onClick={() => deleteInstalledMod(selectedInstalledMod)}
                  >Delete Mod</Button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className='selectedInstalledModVersion'>
                <td>Version</td>
                <td>{mod.get('version')}</td>
              </tr>
              <tr className='selectedInstalledModFactorioVersion'>
                <td>Factorio Version</td>
                <td>{mod.get('factorio_version')}</td>
              </tr>
              <tr className='selectedInstalledModAuthor'>
                <td>Author</td>
                <td>{mod.get('author')}</td>
              </tr>
              <tr className='selectedInstalledModContact'>
                <td>Contact</td>
                <td>{mod.get('contact')}</td>
              </tr>
              <tr className='selectedInstalledModHomepage'>
                <td>Homepage</td>
                <td>{mod.get('homepage')}</td>
              </tr>
              {this.getDependencyList().map((dependency, key) => (
                <tr key={key} className='selectedInstalledModDependency'>
                  <td>{key === 0 ? 'Depdendencies' : ''}</td>
                  <td>{dependency}</td>
                </tr>
              ))}
              <tr><th colSpan='2'>Description</th></tr>
              <tr className='selectedInstalledModDescription'>
                <td colSpan='2'>{mod.get('description')}</td>
              </tr>
            </tbody>
          </Table>) : ''}
      </div>
    )
  }
})
