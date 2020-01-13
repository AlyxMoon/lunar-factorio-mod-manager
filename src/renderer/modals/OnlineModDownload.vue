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
                colspan="3"
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
                <td>
                  {{ dependency.name }}
                </td>
                <td class="cell-check">
                  <template v-if="type === 'required'">
                    <input
                      v-if="!installRequiredRecursive"
                      v-model="dependenciesToInstall[dependency.name]"
                      type="checkbox"
                    >
                    <input
                      v-else
                      v-model="installRequiredRecursive"
                      type="checkbox"
                      disabled
                    >
                  </template>

                  <template v-if="type === 'optional'">
                    <input
                      v-if="!installOptionalRecursive"
                      v-model="dependenciesToInstall[dependency.name]"
                      type="checkbox"
                    >
                    <input
                      v-else
                      v-model="installOptionalRecursive"
                      type="checkbox"
                      disabled
                    >
                  </template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <div class="mt-1">
          <label>
            <input
              v-model="installRequiredRecursive"
              type="checkbox"
            >
            Download all required dependencies (this includes dependencies of dependencies)
          </label>
        </div>

        <div class="mt-1">
          <label>
            <input
              v-model="installOptionalRecursive"
              type="checkbox"
            >
            Download all optional dependencies (this includes dependencies of dependencies)
          </label>
        </div>
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
      installRequiredRecursive: true,
      installOptionalRecursive: false,
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
      return this.filterModDependenciesByType(
        this.releaseData.info_json,
        ['required', 'optional'],
        { parse: true, ignoreInstalled: true, getAsObject: true },
      )
    },
  },
  methods: {
    ...mapActions(['downloadMod', 'fetchFullModInfo']),
    ...mapMutations({
      hideModal: 'HIDE_MODAL',
    }),
    clearData () {
      this.dependenciesToInstall = {}
    },
    async handleConfirm () {
      const downloadQueue = [{ mod: this.mod, release: this.release }]
      const addingToQueue = [...(new Set(
        Object.keys(this.dependenciesToInstall)
          .filter((dependency) => this.dependenciesToInstall[dependency])
          .concat(this.installRequiredRecursive ? this.dependencies.required.map(({ name }) => name) : [])
          .concat(this.installOptionalRecursive ? this.dependencies.optional.map(({ name }) => name) : [])
      ))]

      const isModInQueue = (name) => {
        return downloadQueue.some(d => d.mod.name === name)
      }

      while (addingToQueue.length) {
        const name = addingToQueue.pop()
        const mod = await this.fetchFullModInfo(name)

        if (!mod) {
          return this.$store.dispatch(ADD_TOAST_MESSAGE, {
            text: `
              The mod cannot be downloaded as one of the dependencies is unable to be downloaded!
              Dependency: ${name}
            `,
            type: 'danger',
            dismissAfter: 8000,
          })
        }

        if (!isModInQueue(name)) downloadQueue.push({ mod })

        const nestedDependencies = this.filterModDependenciesByType(
          (mod.latest_release || mod.releases[mod.releases.length - 1]).info_json,
          ['required', 'optional'],
          { parse: true, ignoreInstalled: true, getAsObject: true },
        )

        if (this.installRequiredRecursive) addingToQueue.push(...nestedDependencies.required.map(({ name }) => name))
        if (this.installOptionalRecursive) addingToQueue.push(...nestedDependencies.optional.map(({ name }) => name))
      }

      downloadQueue.forEach(download => this.downloadMod(download))
    },
  },
}
</script>
