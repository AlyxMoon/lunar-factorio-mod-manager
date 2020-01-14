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
    </PanelContent>
  </PanelContainer>
</template>

<script>
import { mapGetters } from 'vuex'
import PanelMenu from './partials/PanelMenu'
import PanelContent from './partials/PanelContent'
import PanelContainer from './partials/PanelContainer'

export default {
  name: 'SavesInfoPanel',
  components: { PanelContainer, PanelContent, PanelMenu },
  computed: {
    ...mapGetters(['selectedSave']),
  },
}
</script>

<style lang="scss" scoped>
img {
  max-width: 100%;
  height: auto;
}
</style>
