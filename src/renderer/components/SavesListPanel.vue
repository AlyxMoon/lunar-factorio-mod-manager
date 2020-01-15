<template>
  <PanelContainer class="installed-mods-panel">
    <PanelMenu>
      <template v-slot:menu-left>
        Factorio Saves
      </template>
    </PanelMenu>

    <PanelContent class="full">
      <transition name="slide-away-left">
        <div
          v-if="!saves"
          key="loading"
          class="flex h-100"
        >
          <i class="fa fa-cog fa-spin" />
          <span class="ml-1">Retrieving Factorio saves</span>
        </div>
        <table
          v-else
          key="saves"
        >
          <tbody>
            <tr
              v-for="(save, index) of saves"
              :key="'save-' + index"
              :class="{ selected: index === selectedSave }"
              @click="setSelectedSave({ selected: index })"
            >
              <td>{{ save.name }}</td>
            </tr>
          </tbody>
        </table>
      </transition>
    </PanelContent>
  </PanelContainer>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import PanelMenu from './partials/PanelMenu'
import PanelContent from './partials/PanelContent'
import PanelContainer from './partials/PanelContainer'

export default {
  name: 'SavesListPanel',
  components: { PanelContainer, PanelContent, PanelMenu },
  computed: {
    ...mapState({
      saves: state => state.saves,
      selectedSave: state => state.selectedSave,
    }),
  },
  methods: {
    ...mapMutations({
      setSelectedSave: 'SET_SELECTED_SAVE',
    }),
  },
}
</script>
