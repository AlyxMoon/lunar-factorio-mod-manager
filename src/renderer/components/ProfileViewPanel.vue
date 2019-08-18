<template>
  <div class="profile-view-panel">
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
      <div>
        <button
          @click="toggleEditProfile()"
          class="btn"
          title="Edit Profile"
        >
          <i class="fa fa-edit" />
        </button>
        <button
          @click="addProfile()"
          class="btn green"
          title="Add Profile"
        >
          <i class="fa fa-plus" />
        </button>
        <button
          @click="removeCurrentProfile()"
          :disabled="profiles.length === 1"
          class="btn red"
          title="Delete Profile"
        >
          <i class="fa fa-trash-alt" />
        </button>
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
              class="btn red"
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
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  name: 'ProfileViewPanel',
  computed: {
    ...mapState({
      profiles: state => state.profiles,
      activeProfile: state => state.activeProfile,
    }),
  },
  methods: {
    ...mapActions([
      'setActiveProfile',
      'removeModFromCurrentProfile',
      'selectMod',
      'toggleEditProfile',
      'addProfile',
      'removeCurrentProfile',
    ]),
  },
}
</script>

<style lang="scss" scoped></style>
