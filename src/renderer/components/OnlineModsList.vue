<template>
  <div class="online-mods-list">
    <table v-if="currentlyDisplayedOnlineMods">
      <tbody>
        <tr v-for="mod in currentlyDisplayedOnlineMods">
          <td>
            {{ mod.name }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'OnlineModsList',
  computed: {
    ...mapGetters(['currentlyDisplayedOnlineMods']),
  },
  created () {
    const mods = this.currentlyDisplayedOnlineMods
    if (!mods || mods.length === 0) {
      this.fetchOnlineMods()
    }
  },
  methods: {
    ...mapActions(['fetchOnlineMods']),
  },
}
</script>

<style lang="scss" scoped>
.online-mods-list {
  height: calc(100% - (#{$menu-height} * 2));
  overflow-y: auto;
}
</style>
