import React from 'react'
import {fromJS} from 'immutable'
import {Table, DropdownButton, MenuItem, ButtonToolbar} from 'react-bootstrap'

const filterInstalled = fromJS([
  {
    eventKey: ['installStatus', 'all'],
    text: 'All'
  },
  {
    eventKey: ['installStatus', 'installed'],
    text: 'Installed'
  },
  {
    eventKey: ['installStatus', 'not installed'],
    text: 'Not Installed'
  }
])
const filterTags = fromJS([
  {
    eventKey: ['tag', 'all'],
    text: 'All'
  },
  {
    eventKey: ['tag', 'general'],
    text: 'General',
    title: 'Mods that cannot be sorted into other categories'
  },
  {
    eventKey: ['tag', 'non-game-changing'],
    text: 'Non-Game-Changing',
    title: 'Changes only look and feel. New graphics, new sounds, such things.'
  },
  {
    eventKey: ['tag', 'helper-mods'],
    text: 'Helper Mods',
    title: 'These mods are not game-changing, but enhance the gameplay by helping you with useful functions. Mods like showing the current game-time, keep track over your resources, rail-laying...'
  },
  {
    eventKey: ['tag', 'transportation'],
    text: 'Transportation',
    title: 'Player transport'
  },
  {
    eventKey: ['tag', 'logistics'],
    text: 'Logistics',
    title: 'Transport of materials'
  },
  {
    eventKey: ['tag', 'utility'],
    text: 'Utility',
    title: 'Helps with certain things the player is doing.'
  },
  {
    eventKey: ['tag', 'balancing'],
    text: 'Balancing'
  },
  {
    eventKey: ['tag', 'weapons'],
    text: 'Weapons'
  },
  {
    eventKey: ['tag', 'enemies'],
    text: 'Enemies'
  },
  {
    eventKey: ['tag', 'armor'],
    text: 'Armor',
    title: 'Armors or armor equipment related.'
  },
  {
    eventKey: ['tag', 'oil'],
    text: 'Oil',
    title: 'Things related to oil related manufacture'
  },
  {
    eventKey: ['tag', 'logistic-network'],
    text: 'Logistic Network',
    title: 'Related to roboports and logistic robots'
  },
  {
    eventKey: ['tag', 'storage'],
    text: 'Storage'
  },
  {
    eventKey: ['tag', 'power-production'],
    text: 'Power Production'
  },
  {
    eventKey: ['tag', 'manufacture'],
    text: 'Manufacture',
    title: 'Furnaces, assembling machines, production chains'
  },
  {
    eventKey: ['tag', 'blueprints'],
    text: 'Blueprints'
  },
  {
    eventKey: ['tag', 'cheats'],
    text: 'Cheats'
  },
  {
    eventKey: ['tag', 'mining'],
    text: 'Mining'
  },
  {
    eventKey: ['tag', 'info'],
    text: 'Info',
    title: 'Mods that provide additional information to the player'
  },
  {
    eventKey: ['tag', 'trains'],
    text: 'Trains'
  },
  {
    eventKey: ['tag', 'big-mods'],
    text: 'Big Mods',
    title: 'Too big and/or changes too much of the game to be fit anywhere else '
  }
])
const sortOptions = fromJS([
  {
    eventKey: ['name', 'ascending'],
    text: 'Name - A to Z'
  },
  {
    eventKey: ['name', 'descending'],
    text: 'Name - Z to A'
  },
  {
    eventKey: ['owner', 'ascending'],
    text: 'Owner - A to Z'
  },
  {
    eventKey: ['owner', 'descending'],
    text: 'Owner - Z to A'
  },
  {
    eventKey: ['downloads_count', 'ascending'],
    text: 'Downloads - High to Low'
  },
  {
    eventKey: ['downloads_count', 'descending'],
    text: 'Downloads - Low to High'
  },
  {
    eventKey: ['released_at', 'ascending'],
    text: 'Updated - Most Recent'
  },
  {
    eventKey: ['released_at', 'descending'],
    text: 'Updated - Least Recent'
  }
])

export const OnlineModListView = React.createClass({
  handleFilter (filterBy) {
    this.props.setOnlineModFilter(filterBy.get(0), filterBy.get(1))
  },

  handleSort (sortBy) {
    this.props.setOnlineModSort(sortBy.get(0), sortBy.get(1))
  },

  render () {
    let {onlineMods, selectedOnlineMod, setSelectedOnlineMod, filterBy, sortBy} = this.props
    return (
      <div className='onlineModsList'>
        <Table hover condensed bordered responsive>
          <thead>
            <tr className='bg-primary'>
              <th colSpan='2'>
                All Online Mods
                <span className='sortAndFilterMods'>
                  <ButtonToolbar>
                    <DropdownButton
                      id='filterModsButton'
                      title='Filter'
                      pullRight bsSize='xsmall' bsStyle='default'
                      onSelect={this.handleFilter}>
                      <MenuItem header>Download Status</MenuItem>
                      {filterInstalled.map((option, key) => (
                        <MenuItem
                          key={key}
                          className='setOnlineModFilter'
                          eventKey={option.get('eventKey')}
                          active={option.getIn(['eventKey', 1]) === filterBy.get('installStatus', 'all')} >
                          {option.get('text')}
                        </MenuItem>
                      ))}
                      <MenuItem header>Tags</MenuItem>
                      {filterTags.map((option, key) => (
                        <MenuItem
                          key={key}
                          className='setOnlineModFilter'
                          eventKey={option.get('eventKey')}
                          active={option.getIn(['eventKey', 1]) === filterBy.get('tag', 'all')}
                          title={option.get('title', '')} >
                          {option.get('text')}
                        </MenuItem>
                      ))}
                    </DropdownButton>
                    <DropdownButton
                      id='sortModsButton'
                      title='Sort'
                      pullRight bsSize='xsmall' bsStyle='default'
                      onSelect={this.handleSort}>
                      {sortOptions.map((option, key) => (
                        <MenuItem
                          key={key}
                          className='setOnlineModSort'
                          eventKey={option.get('eventKey')}
                          active={option.get('eventKey').equals(sortBy)}>
                          {option.get('text')}
                        </MenuItem>
                      ))}
                    </DropdownButton>
                  </ButtonToolbar>
                </span>
              </th>
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
