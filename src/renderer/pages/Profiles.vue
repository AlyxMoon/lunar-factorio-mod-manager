<template>
  <div>
    <div class="profile-grid">
      <div class="profile-mod-list">
        <div class="menu">
          <div>
            <span class="menu-label">Active Profile</span>
            <select @change="setActiveProfile($event.target.value); $event.target.blur()">
              <option
                v-for="(profile, index) in profiles"
                :key="index"
                :selected="index === activeProfile"
                :value="index"
              >
                {{ profile.name }}
              </option>
            </select>
          </div>
        </div>

        <table v-if="profiles && activeProfile >= 0">
          <thead>
            <tr>
              <th class="cell-check" />
              <th>Name</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mod in profiles[activeProfile].mods">
              <td class="cell-check">
                <button
                  @click="removeModFromCurrentProfile(mod)"
                  :disabled="mod.name === 'base'"
                  class="btn btn-red"
                >
                  <i class="fa fa-minus" />
                </button>
              </td>
              <td @click="selectMod(mod)">
                {{ mod.name }}
              </td>
              <td>{{ mod.version }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="column row-2">
        <ComponentInstalledModsList />
        <ComponentModInfoPanel />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import InstalledModsList from '@/components/InstalledModsList'
import ModInfoPanel from '@/components/ModInfoPanel'

export default {
  name: 'Home',
  components: {
    ComponentInstalledModsList: InstalledModsList,
    ComponentModInfoPanel: ModInfoPanel,
  },
  computed: {
    ...mapState({
      activeProfile: state => state.activeProfile,
      profiles: state => state.profiles,
    }),
  },
  methods: {
    ...mapActions(['removeModFromCurrentProfile', 'setActiveProfile', 'selectMod']),
  },
}
</script>

<style lang="scss" scoped>
.menu {
  box-sizing: border-box;
  padding: 5px;
}

.profile-grid {
  background-color: $background-secondary-color;
  display: grid;
  width: 100%;
  height: 100%;

  grid-template-columns: 1fr 1fr;
  grid-column-gap: 10px;
  grid-template-rows: 100%;

  .profile-mod-list {
    background-color: $background-primary-color;
    height: 100%;
  }
}

.column {
  display: grid;
  grid-row-gap: 10px;

  width: 100%;
  height: 100%;

  &.row-2 {
    grid-template-columns: 1fr;
    grid-template-rows: calc(50% - 10px);
  }

  & > * {
    background-color: $background-primary-color;
  }
}
</style>
