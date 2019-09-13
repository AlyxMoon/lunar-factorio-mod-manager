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
            <i
              v-if="isModDownloaded(mod.name)"
              class="fa fa-check"
              title="Already Downloaded"
            />
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
    ...mapGetters(['currentlyDisplayedOnlineMods', 'isModDownloaded']),
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
