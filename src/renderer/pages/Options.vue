<template>
  <div class="page-options">
    <label>
      Close app when starting Factorio
      <input
        v-model="options.closeOnStartup"
        type="checkbox"
      >
    </label>

    <label>
      How often to poll the mod portal for all online mods
      <input
        v-model="options.onlinePollingInterval"
        type="number"
      >
    </label>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PageOptions',
  computed: {
    ...mapState({
      options: 'options',
    }),
  },
}
</script>

<style lang="scss" scoped>

</style>
