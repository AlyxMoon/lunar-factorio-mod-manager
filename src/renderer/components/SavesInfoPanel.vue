<template>
  <PanelContainer class="save-info-panel">
    <PanelMenu>
      <template v-slot:menu-left>
        {{ selectedSave ? selectedSave.name : 'Selected Save Info' }}
      </template>
    </PanelMenu>

    <PanelContent v-if="selectedSave">
      <hr>
      <img :src="selectedSave.preview">

      <table class="no-hover">
        <tbody>
          <tr>
            <th>Factorio Version</th>
            <td>{{ selectedSave.version }}</td>
          </tr>
          <tr>
            <th>Scenario</th>
            <td>{{ selectedSave.scenario }}</td>
          </tr>
        </tbody>
      </table>

      <button
        v-if="selectedSave.mods && selectedSave.mods.length"
        class="btn mt-1"
        :disabled="creatingProfile"
        @click="handleCreate"
      >
        <i
          v-if="creatingProfile"
          class="fa fa-cog fa-spin"
        />
        Create profile from save
      </button>

      <h3
        class="mt-1 mb-1"
      >
        Mods Used
      </h3>
      <table class="no-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Version</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(mod, index) in selectedSave.mods"
            :key="'mod-' + index"
          >
            <td>{{ mod.name }}</td>
            <td>{{ mod.version }}</td>
          </tr>
        </tbody>
      </table>
    </PanelContent>
  </PanelContainer>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import PanelMenu from './partials/PanelMenu'
import PanelContent from './partials/PanelContent'
import PanelContainer from './partials/PanelContainer'

export default {
  name: 'SavesInfoPanel',
  components: { PanelContainer, PanelContent, PanelMenu },
  data () {
    return {
      creatingProfile: false,
    }
  },
  computed: {
    ...mapGetters(['selectedSave']),
  },
  methods: {
    ...mapActions(['addProfile']),
    async handleCreate () {
      this.creatingProfile = true
      const profile = {
        name: this.selectedSave.name,
        mods: this.selectedSave.mods,
      }

      await (() => new Promise(resolve => setTimeout(resolve, 1000)))() // I want to delay a bit for animation
      await this.addProfile(profile)

      this.creatingProfile = false
    },
  },
}
</script>

<style lang="scss" scoped>
img {
  max-width: 100%;
  height: auto;
}
</style>
