<template>
  <div class="profile-view-panel">
    <div class="menu">
      <div>
        <span class="menu-label">Active Profile</span>
        <select @change="setActiveProfile($event.target.value); $event.target.blur()">
          <option
            v-for="(profile, index) in profiles"
            :key="index"
            :selected="index === activeProfileIndex"
            :value="index"
          >
            {{ profile.name }}
          </option>
        </select>
      </div>
      <div>
        <button
          @click="showModal({ name: 'ModalProfileCreateOrEdit', option: 'edit' })"
          class="btn"
          title="Edit Profile"
        >
          <i class="fa fa-edit" />
        </button>
        <button
          @click="showModal({ name: 'ModalProfileCreateOrEdit', option: 'create' })"
          class="btn green"
          title="Add Profile"
        >
          <i class="fa fa-plus" />
        </button>
        <button
          @click="showModal({ name: 'ModalProfileDelete' })"
          :disabled="!profiles || profiles.length === 1"
          class="btn red"
          title="Delete Profile"
        >
          <i class="fa fa-trash-alt" />
        </button>
      </div>
    </div>

    <div class="table-responsive-wrapper">
      <table v-if="currentProfile">
        <thead>
          <tr>
            <th class="cell-check" />
            <th>Name</th>
            <th>Version</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mod in currentProfile.mods"
            :class="{ selected: mod.name === selectedMod.name }"
          >
            <td class="cell-check">
              <button
                @click="removeModFromCurrentProfile(mod)"
                :disabled="mod.name === 'base'"
                class="btn red"
              >
                <i class="fa fa-minus" />
              </button>
            </td>
            <td @click="selectInstalledMod(mod.name)">
              <button
                v-if="isModMissingDependenciesInActiveProfile(mod.name)"
                @click="addMissingModDependenciesToActiveProfile(mod.name)"
                class="btn small"
                title="A required dependency is not included in the profile, click here to add any missing dependencies"
              >
                <i class="fa fa-exclamation-circle" />
              </button>
              {{ mod.title || mod.name }}
            </td>
            <td>{{ mod.version }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="menu bottom">
      <div class="menu-section">
        <span class="menu-label">Mods: {{ (currentProfile && currentProfile.mods.length) || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
export default {
  name: 'ProfileViewPanel',
  computed: {
    ...mapState({
      profiles: state => state.profiles,
      activeProfileIndex: state => state.activeProfile,
      selectedMod: state => state.selectedMod || {},
    }),
    ...mapGetters(['currentProfile', 'isModMissingDependenciesInActiveProfile']),
  },
  methods: {
    ...mapMutations({
      showModal: 'SHOW_MODAL',
    }),
    ...mapActions([
      'addMissingModDependenciesToActiveProfile',
      'setActiveProfile',
      'removeModFromCurrentProfile',
      'selectInstalledMod',
      'toggleEditProfile',
      'addProfile',
      'removeCurrentProfile',
    ]),
  },
}
</script>

<style lang="scss" scoped>

 .menu {
   height: 40px;

   &.bottom {
     border-top: 2px solid $highlight-color;
   }
 }
 .table-responsive-wrapper {
   height: calc(100% - 80px);
   overflow-y: auto;
 }
</style>
