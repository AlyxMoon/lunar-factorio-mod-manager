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
          <Table responsive bordered condensed>
            <thead>
              <tr className='selectedInstalledModName'>
                <th className='bg-primary' colSpan='2'>
                  {mod.get('name')}
                  <Button
                    bsStyle='danger'
                    className='deleteInstalledMod'
                    onClick={() => deleteInstalledMod(selectedInstalledMod)}
                  >Delete</Button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className='selectedInstalledModVersion'>
                <th>Version</th>
                <td>{mod.get('version')}</td>
              </tr>
              <tr className='selectedInstalledModFactorioVersion'>
                <th>Factorio Version</th>
                <td>{mod.get('factorio_version')}</td>
              </tr>
              <tr className='selectedInstalledModAuthor'>
                <th>Author</th>
                <td>{mod.get('author')}</td>
              </tr>
              <tr className='selectedInstalledModContact'>
                <th>Contact</th>
                <td>{mod.get('contact')}</td>
              </tr>
              <tr className='selectedInstalledModHomepage'>
                <th>Homepage</th>
                <td>{mod.get('homepage')}</td>
              </tr>
              {this.getDependencyList().map((dependency, key) => (
                <tr key={key} className='selectedInstalledModDependency'>
                  <th>{key === 0 ? 'Dependencies' : ''}</th>
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
