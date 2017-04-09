import React from 'react'
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
          <div className='panel panel-primary'>
            <div className='panel-heading selectedInstalledModName'>
              {mod.has('latestAvailableUpdate') &&
                <span
                  title='Update Mod'
                  className='updateInstalledMod'
                  onClick={this.sendDownloadRequest} >
                  <i className='glyphicon glyphicon-download-alt' />
                </span>
              }
              <strong>{mod.get('name')}</strong>
              <span
                title='Delete Mod'
                className='deleteInstalledMod'
                onClick={() => deleteInstalledMod(selectedInstalledMod)}
              ><i className='glyphicon glyphicon-remove' /></span>
            </div>
            <div className='panel-body'>
              <strong>Version</strong>
              <p className='selectedInstalledModVersion'>{mod.get('version')}</p>
              <strong>Factorio Version</strong>
              <p className='selectedInstalledModFactorioVersion'>{mod.get('factorio_version')}</p>
              <strong>Author</strong>
              <p className='selectedInstalledModAuthor'>{mod.get('author')}</p>
              <strong>Contact</strong>
              <p className='selectedInstalledModContact'>{mod.get('contact')}</p>
              <strong>Homepage</strong>
              <p className='selectedInstalledModHomepage'>{mod.get('homepage')}</p>
              <strong>Dependencies</strong>
              <ul>
                {this.getDependencyList().map((dependency, key) => (
                  <li key={key} className='selectedInstalledModDependency'>{dependency}</li>
                ))}
              </ul>
              <strong>Description</strong><br />
              <p className='selectedInstalledModDescription'>
                {mod.get('description')}
              </p>
            </div>
          </div>
        ) : '' }
      </div>
    )
  }
})
