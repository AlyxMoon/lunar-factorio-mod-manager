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
        </tr>
      </thead>
      <tbody>
        <tr v-for="mod in installedMods">
          <td class="cell-check">
            <button
              @click="addModToCurrentProfile(mod)"
              :disabled="editingProfile || isModInCurrentProfile(mod)"
              class="btn green"
            >
              <i class="fa fa-plus" />
            </button>
          </td>
          <td @click="selectMod(mod)">
            {{ mod.name }}
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
    }),
    ...mapGetters(['isModInCurrentProfile']),
  },
  methods: {
    ...mapActions(['addModToCurrentProfile', 'selectMod']),
  },
}
</script>

<style>
.installed-mods-list {
  overflow-y: auto;
}
</style>
