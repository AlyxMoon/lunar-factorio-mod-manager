<template>
  <PanelContainer class="installed-mods-panel">
    <PanelMenu>
      <template v-slot:menu-left>
        Installed Mods
      </template>
    </PanelMenu>

    <PanelContent class="full">
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
                :disabled="isModInCurrentProfile(mod)"
                class="btn green"
              >
                <i class="fa fa-plus" />
              </button>
            </td>
            <td @click="selectInstalledMod(mod.name)">
              <i
                v-if="isModUpdateAvailable(mod.name)"
                class="fa fa-arrow-up"
                title="Update available!"
              />
              <i
                v-if="mod.hasMissingRequiredDependencies"
                class="fa fa-exclamation-circle"
                title="There are required dependencies not installed!"
              />
              {{ mod.title }}
            </td>
            <td @click="selectInstalledMod(mod.name)">
              {{ mod.version }}
            </td>
          </tr>
        </tbody>
      </table>
    </PanelContent>
  </PanelContainer>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import PanelMenu from './partials/PanelMenu'
import PanelContent from './partials/PanelContent'
import PanelContainer from './partials/PanelContainer'

export default {
  name: 'InstalledModsListPanel',
  components: { PanelContainer, PanelContent, PanelMenu },
  computed: {
    ...mapState({
      installedMods: state => state.installedMods,
      selectedMod: state => state.selectedMod || {},
    }),
    ...mapGetters(['isModUpdateAvailable', 'isModInCurrentProfile']),
  },
  methods: {
    ...mapActions(['addModToCurrentProfile', 'selectInstalledMod']),
  },
}
</script>
