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
              <td>{{ mod.name }}</td>
              <td>{{ mod.version }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ComponentInstalledModsList />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import InstalledModsList from '@/components/InstalledModsList'

export default {
  name: 'Home',
  components: {
    ComponentInstalledModsList: InstalledModsList,
  },
  computed: {
    ...mapState({
      activeProfile: state => state.activeProfile,
      profiles: state => state.profiles,
    }),
  },
  methods: {
    ...mapActions(['removeModFromCurrentProfile', 'setActiveProfile']),
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

  .profile-mod-list {
    background-color: $background-primary-color;
    height: 100%;
  }
}
</style>
