import React from 'react'
import {Table} from 'react-bootstrap'
import {List} from 'immutable'

export const InstalledModDetailedView = React.createClass({
  // Some mods only have a single dependency listed as a string instead of an array. This will fix that.
  getDependencyList () {
    const dependencies = this.props.mod.get('dependencies', List())
    return typeof dependencies === 'string' ? List.of(dependencies) : dependencies
  },

  sendDownloadRequest () {
    let name = this.props.mod.getIn(['latestAvailableUpdate', 'info_json', 'name'])
    let link = this.props.mod.getIn(['latestAvailableUpdate', 'download_url'])
    this.props.requestDownload(name, link)
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
                  {mod.has('latestAvailableUpdate') &&
                    <span
                      title='Update Mod'
                      className='updateInstalledMod'
                      onClick={this.sendDownloadRequest} >
                      <i className='glyphicon glyphicon-download-alt' />
                    </span>
                  }
                  {mod.get('name')}
                  <span
                    title='Delete Mod'
                    className='deleteInstalledMod'
                    onClick={() => deleteInstalledMod(selectedInstalledMod)}
                  ><i className='glyphicon glyphicon-remove' /></span>
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
