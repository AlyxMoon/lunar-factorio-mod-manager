<template>
  <PanelContainer v-if="mod || fetching">
    <PanelMenu>
      <template v-slot:menu-left>
        {{ mod ? mod.title : 'Selected Mod Info' }}
      </template>
      <template
        v-slot:menu-right
        v-if="mod"
      >
        <button
          @click="showModal({ name: 'ModalOnlineModDownload', options: { mod } })"
          :disabled="isModDownloaded(mod.name) && !isModUpdateAvailable(mod.name)"
          :title="isModDownloaded(mod.name) ? (isModUpdateAvailable(mod.name) ? 'Download Update' : 'Mod is already downloaded') : 'Download Latest Mod Version'"
          class="btn"
        >
          <i class="fa fa-download" />
        </button>
      </template>
    </PanelMenu>

    <PanelContent>
      <transition name="slide-away-left">
        <div
          key="loading"
          v-if="fetching"
          class="flex mt-5"
        >
          <i class="fa fa-cog fa-spin" />
          <span class="ml-1">Fetching information for {{ fetching }}</span>
        </div>

        <div
          key="content"
          v-else
        >
          <hr>
          <div class="flex justify-space-b align-start">
            <div class="mod-description">
              {{ mod.summary }}
            </div>
            <div
              v-if="mod.thumbnail && mod.thumbnail !== '/assets/.thumb.png'"
              class="mod-image"
            >
              <img :src="'https://mods-data.factorio.com' + mod.thumbnail">
            </div>
          </div>

          <h3 class="mt-2">
            Mod Info
          </h3>
          <hr class="compact">

          <table class="no-hover">
            <tbody>
              <tr>
                <th>Author</th>
                <td>{{ mod.owner }}</td>
              </tr>
              <tr>
                <th>Category</th>
                <td>{{ mod.category }}</td>
              </tr>
              <tr>
                <th>Downloads</th>
                <td>{{ mod.downloads_count }}</td>
              </tr>
            </tbody>
          </table>

          <h3 class="mt-2">
            Releases
          </h3>
          <hr class="compact">
          <template v-if="mod && mod.releases">
            <table class="no-hover">
              <thead>
                <tr>
                  <th class="cell-check" />
                  <th>Version</th>
                  <th>Game Version</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(release, i) in mod.releases.slice().reverse()">
                  <td class="cell-check">
                    <button
                      @click="showModal({
                        name: 'ModalOnlineModDownload',
                        options: { mod, release: mod.releases.length - i - 1 }
                      })"
                      class="btn"
                      title="Download this release"
                    >
                      <i class="fa fa-download" />
                    </button>
                  </td>
                  <td>{{ release.version }}</td>
                  <td>{{ release.info_json.factorio_version }}</td>
                </tr>
              </tbody>
            </table>
          </template>
          <template v-else>
            <i class="fa fa-cog fa-spin" /> Fetching data
          </template>
        </div>
      </transition>
    </PanelContent>
  </PanelContainer>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import PanelMenu from './partials/PanelMenu'
import PanelContent from './partials/PanelContent'
import PanelContainer from './partials/PanelContainer'

export default {
  name: 'ModInfoPanel',
  components: { PanelContainer, PanelContent, PanelMenu },
  computed: {
    ...mapState({
      mod: state => state.selectedOnlineMod,
      fetching: state => state.fetchingOnlineMod,
    }),
    ...mapGetters(['isModDownloaded', 'isModUpdateAvailable']),
  },
  methods: {
    ...mapMutations({
      showModal: 'SHOW_MODAL',
    }),
  },
}
</script>
