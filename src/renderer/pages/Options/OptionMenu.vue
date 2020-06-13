<template>
  <PanelMenu>
    <template v-slot:menu-left>
      <label>Edit Environment</label>
      <select @change="active = $event.target.value; $event.target.blur()">
        <option
          v-for="(environment, index) in environments"
          :key="index"
          :selected="index === active"
          :value="index"
        >
          {{ environment.name }}
        </option>
      </select>
    </template>
    <template v-slot:menu-right>
      <button
        class="btn green"
        title="Add Environment"
        @click="showModal({ name: 'ModalEnvironmentCreate' })"
      >
        <i class="fa fa-plus" />
      </button>
    </template>
  </PanelMenu>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

import PanelMenu from '@/components/partials/PanelMenu'

export default {
  name: 'OptionMenu',
  components: {
    PanelMenu,
  },
  data: () => ({
    active: 0,
  }),
  computed: {
    ...mapState({
      activeProfileEnvironment: state => state.environments.active,
      environments: state => state.environments.list,
    }),
  },

  created () {
    this.active = this.activeProfileEnvironment
  },

  methods: {
    ...mapMutations({
      showModal: 'SHOW_MODAL',
    }),
  },
}
</script>

<style lang="scss" scoped>

</style>
