<template>
  <div class="installed-mods-list">
    <div class="menu">
      <div>
        <span class="menu-label">Available Mods</span>
      </div>
    </div>

    <table v-if="installedMods">
      <thead>
        <tr>
          <th class="cell-check" />
          <th>Name</th>
          <th>Version</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="mod in installedMods"
          :class="{ selected: mod.name === selectedMod.name }"
        >
          <td class="cell-check">
            <button
              @click="addModToCurrentProfile(mod)"
              :disabled="editingProfile || isModInCurrentProfile(mod)"
              class="btn green"
            >
              <i class="fa fa-plus" />
            </button>
          </td>
          <td @click="selectInstalledMod(mod.name)">
            {{ mod.title }}
          </td>
          <td @click="selectInstalledMod(mod.name)">
            {{ mod.version }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'InstalledModsList',
  computed: {
    ...mapState({
      installedMods: state => state.installedMods,
      editingProfile: state => state.editingProfile,
      selectedMod: state => state.selectedMod || {},
    }),
    ...mapGetters(['isModInCurrentProfile']),
  },
  methods: {
    ...mapActions(['addModToCurrentProfile', 'selectInstalledMod']),
  },
}
</script>

<style>
.installed-mods-list {
  overflow-y: auto;
}
</style>
