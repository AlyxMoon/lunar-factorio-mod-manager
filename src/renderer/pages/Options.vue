<template>
  <div class="page-options">
    <label>
      Close app when starting Factorio
      <input
        type="checkbox"
        :checked="options.closeOnStartup"
        @change="updateOption({ name: 'closeOnStartup', value: $event.target.checked })"
      >
    </label>

    <label>
      How often to poll the mod portal (in days) for all online mods
      <input
        type="number"
        :value="options.onlinePollingInterval"
        @change="updateOption({ name: 'onlinePollingInterval', value: $event.target.value })"
      >
    </label>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'PageOptions',
  computed: {
    ...mapState({
      options: 'options',
    }),
  },
  methods: {
    ...mapActions(['updateOption']),
  },
}
</script>

<style lang="scss" scoped>
.page-options {
  padding: 10px 20px;
}

label {
  display: flex;
  flex-direction: column;
  align-items: left;

  input {
    margin-top: 5px;
    margin-bottom: 20px;
    padding: 15px;
    width: fit-content;

    &[type="checkbox"] {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
