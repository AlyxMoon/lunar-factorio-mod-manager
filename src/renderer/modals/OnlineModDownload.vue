<template>
  <ModalContainer
    v-on:confirm="handleConfirm(); hideModal()"
    v-on:hidden="clearData()"
  >
    <template v-slot:title>
      <span>Download | {{ mod.title }}</span>
    </template>
    <template v-slot:content>
      Download mod version {{ releaseData.version }}

      <template v-if="dependencies.length">
        <p class="mt-2">
          If you would like to download any dependencies for this mod at the same time, check the box next to it in the table.
        </p>
        <table class="no-hover mt-1">
          <thead>
            <tr>
              <th
                colspan="4"
                class="text-align-center"
              >
                Missing Dependencies
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="type of ['required', 'optional']">
              <tr v-for="(dependency, index) of dependencies[type]">
                <td
                  v-if="index === 0"
                  :rowspan="dependencies[type].length"
                >
                  {{ type }}
                </td>
                <td :colspan="dependency.version ? '1' : '2'">
                  {{ dependency.name }}
                </td>
                <td v-if="dependency.version">
                  {{ dependency.operator }} {{ dependency.version }}
                </td>
                <td class="cell-check">
                  <input
                    v-model="dependenciesToInstall[dependency.name]"
                    type="checkbox"
                  >
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </template>
    </template>
  </ModalContainer>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { ADD_TOAST_MESSAGE } from 'vuex-toast'
import ModalContainer from './_ModalContainer'

export default {
  name: 'ModalOnlineModDownload',
  components: { ModalContainer },
  data () {
    return {
      dependenciesToInstall: {},
    }
  },
  computed: {
    ...mapState({
      mod: state => state.modals.ModalOnlineModDownload.mod || {},
      installedMods: state => state.installedMods,
      release: state => state.modals.ModalOnlineModDownload.release || -1,
      releaseData: state => {
        const { mod, release } = state.modals.ModalOnlineModDownload
        return release > -1
          ? mod.releases[release]
          : mod.latest_release || mod.releases[mod.releases.length - 1]
      },
    }),
    ...mapGetters(['filterModDependenciesByType', 'getOnlineInfoForMod']),
    dependencies () {
      return this.$store.getters.filterModDependenciesByType(
        this.releaseData.info_json,
        ['required', 'optional'],
        { parse: true, ignoreInstalled: true, getAsObject: true },
      )
    },
  },
  methods: {
    ...mapActions(['downloadMod']),
    ...mapMutations({
      hideModal: 'HIDE_MODAL',
    }),
    clearData () {
      this.dependenciesToInstall = {}
    },
    handleConfirm () {
      const dependenciesDownloadInfo = []
      for (const dependency in this.dependenciesToInstall) {
        if (this.dependenciesToInstall[dependency]) {
          const mod = this.getOnlineInfoForMod({ name: dependency })

          if (!mod) {
            this.$store.dispatch(ADD_TOAST_MESSAGE, {
              text: `
                The mod cannot be downloaded as one of the dependencies is unable to be downloaded!
                Dependency: ${dependency}
              `,
              type: 'danger',
              dismissAfter: 8000,
            })
            return
          }

          dependenciesDownloadInfo.push(mod)
        }
      }

      this.downloadMod({ mod: this.mod, release: this.release })
      dependenciesDownloadInfo.forEach(mod => {
        this.downloadMod({ mod })
      })
    },
  },
}
</script>
