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
          type="number"
          :value="options.onlinePollingInterval"
          @change="updateOption({ name: 'onlinePollingInterval', value: parseInt($event.target.value, 10) })"
        >
      </label>
    </form>

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
  computed: {
    ...mapState({
      options: 'options',
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
    ...mapActions(['updateOption']),
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

form {
  label {
    display: flex;
    flex-direction: column;
    align-items: left;
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
