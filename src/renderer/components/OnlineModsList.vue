<template>
  <div class="online-mods-list">
    <table v-if="currentlyDisplayedOnlineMods">
      <tbody>
        <tr
          v-for="mod in currentlyDisplayedOnlineMods"
          @click="selectOnlineMod(mod)"
          :class="{ selected: mod.name === selectedOnlineMod.name }"
        >
          <td>
            {{ mod.title }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'OnlineModsList',
  computed: {
    ...mapState({
      selectedOnlineMod: state => state.selectedOnlineMod || {},
    }),
    ...mapGetters(['currentlyDisplayedOnlineMods']),
  },
  methods: {
    ...mapActions(['selectOnlineMod']),
  },
}
</script>

<style lang="scss" scoped>
.online-mods-list {
  height: calc(100% - (#{$menu-height} * 3));
  overflow-y: auto;
}
</style>
