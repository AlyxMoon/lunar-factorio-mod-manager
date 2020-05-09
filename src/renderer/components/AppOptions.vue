<template>
  <form
    class="app-options"
    @submit.prevent
  >
    <h2>Factorio Paths</h2>
    <div
      v-for="path of pathOptions"
      :key="'path-' + path.variable"
      class="input-group"
    >
      <label>
        <tooltip>{{ path.hint }}</tooltip>
        {{ path.text }}
      </label>
      <button @click="promptNewFactorioPath(path.variable)">
        Change
      </button>
      <input
        type="text"
        :value="paths[path.variable]"
        disabled
      >
    </div>

    <h2>App Settings</h2>
    <div>
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
          type="text"
          :value="options.onlinePollingInterval"
          @change="updateOption({ name: 'onlinePollingInterval', value: parseInt($event.target.value, 10) })"
        >
      </label>
    </div>

    <h2>LFMM Paths</h2>
    <div class="paths-container">
      <button @click="openFolder(userDataPath)">
        Open Folder
      </button>
      <label>AppData Directory</label>
      <span>{{ userDataPath }}</span>

      <button @click="openFolder(logsPath)">
        Open Folder
      </button>
      <label>Logs Directory</label>
      <span>{{ logsPath }}</span>
      <span /><span />
      <div>
        <button @click="openFolder(logsPath + '/info-log.txt')">
          Open Info Log
        </button>
        <button @click="openFolder(logsPath + '/error-log.txt')">
          Open Error Log
        </button>
      </div>

      <button @click="openFolder(configPath)">
        Open Folder
      </button>
      <label>Config Directory</label>
      <span>{{ configPath }}</span>
      <span /><span />
      <div>
        <button @click="openFolder(configPath + '/config.json')">
          Open Configuration File
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { join } from 'path'
import { remote } from 'electron'

import { mapActions, mapState } from 'vuex'

import Tooltip from '@/components/partials/Tooltip'

export default {
  name: 'PageOptions',
  components: { Tooltip },
  data: () => ({
    pathOptions: [
      {
        text: 'Factorio Data Path',
        variable: 'factorioDataDir',
        hint: 'This is the Factorio data directory. It is used to load the base data used in Factorio which lets the app know which version of Factorio is actively in use. This is needed to correctly manage mod versions.',
      },
      {
        text: 'Factorio Exe Path',
        variable: 'factorioExe',
        hint: 'This is the Factorio executable. It is not required, without it you will be unable to start Factorio through the app.',
      },
      {
        text: 'Mods Folder Path',
        variable: 'modDir',
        hint: 'This is where Factorio looks for mods (and contains the mod-list.json file). Without this the app will be unable to manage mods in any way.',
      },
      {
        text: 'PlayerData File Path',
        variable: 'playerDataFile',
        hint: 'This is where the player-data.json is located, typically with the rest of the Factorio configuration/data files (mods, saves, config, ect.). It is not required. This is used to read the player username and auth token, which is needed to download mods from the online portal.',
      },
      {
        text: 'Saves Folder Path',
        variable: 'saveDir',
        hint: 'This is where the saves folder is. It is not required, without it you will be unable to look at saves in the app and create profiles based on them.',
      },
    ],
  }),
  computed: {
    ...mapState({
      options: 'options',
      paths: 'paths',
    }),
    userDataPath () {
      return remote.app.getPath('userData')
    },
    logsPath () {
      return join(this.userDataPath, 'logs')
    },
    configPath () {
      return join(this.userDataPath, 'data')
    },
  },
  methods: {
    ...mapActions(['promptNewFactorioPath', 'updateOption']),
    openFolder (path) {
      remote.shell.openItem(path)
    },
  },
}
</script>

<style lang="scss" scoped>
form {
  padding: 10px 20px;
}

h2 {
  margin: 20px 0;
  padding-bottom: 5px;

  border-bottom: 2px dashed $highlight-color;
}

label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

input {
  margin-top: 5px;
  margin-bottom: 20px;
  padding: 15px;
  width: fit-content;

  &[type="checkbox"] {
    width: 20px;
    height: 20px;
  }

  &:disabled {
    cursor: text;
  }
}

.input-group label {
  flex-direction: row;
}

.paths-container {
  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-template-rows: 1fr;

  align-items: center;
  grid-gap: 10px;
}
</style>
