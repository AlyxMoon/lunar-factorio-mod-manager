<template>
  <PanelContainer class="save-info-panel">
    <PanelMenu>
      <template v-slot:menu-left>
        {{ selectedSave ? selectedSave.title : 'Selected Save Info' }}
      </template>
    </PanelMenu>

    <PanelContent v-if="selectedSave">
      <hr>
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
div.mod-info-panel {
  background-color: $background-secondary-color;
  border: 5px solid $background-primary-color;

  height: 100%;
  display: flex;
  flex-direction: column;
}

div.mod-info-content {
  height: calc(100% - 40px);
  padding: 5px 10px;

  overflow-y: auto;

  & > div {
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
  }
}
</style>
