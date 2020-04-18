<template>
  <div class="page-options">
    <form @submit.prevent>
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

      <div
        v-for="path of pathOptions"
        :key="'path-' + path.variable"
        class="input-group"
      >
        <label>{{ path.text }}</label>
        <button
          @click="promptNewFactorioPath(path.variable)"
        >
          Change
        </button>
        <input
          type="text"
          :value="paths[path.variable]"
          disabled
        >
      </div>
    </form>

    <hr>

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
  </div>
</template>

<script>
import { join } from 'path'
import { remote } from 'electron'

import { mapActions, mapState } from 'vuex'

export default {
  name: 'PageOptions',
  data: () => ({
    pathOptions: [
      { text: 'Factorio Exe Path', variable: 'factorio' },
      { text: 'Mods Folder Path', variable: 'mods' },
      { text: 'PlayerData File Path', variable: 'playerData' },
      { text: 'Saves Folder Path', variable: 'saves' },
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
.page-options {
  padding: 10px 20px;
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

.paths-container {
  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-template-rows: 1fr;

  align-items: center;
  grid-gap: 10px;
}
</style>
