<template>
  <div class="installed-mods-list">
    <div class="menu">
      <div>
        <span class="menu-label">Available Mods</span>
      </div>
    </div>

    <table v-if="installedMods">
      <thead>
        <tr>
          <th class="cell-check" />
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mod in installedMods">
          <td class="cell-check">
            <button
              @click="addModToCurrentProfile(mod)"
              :disabled="isModInCurrentProfile(mod)"
              class="btn btn-green"
            >
              <i class="fa fa-plus" />
            </button>
          </td>
          <td>{{ mod.name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'InstalledModsList',
  computed: {
    ...mapState({
      installedMods: state => state.installedMods,
    }),
    ...mapGetters(['isModInCurrentProfile']),
  },
  methods: {
    ...mapActions(['addModToCurrentProfile']),
  },
}
</script>

<style>

</style>
