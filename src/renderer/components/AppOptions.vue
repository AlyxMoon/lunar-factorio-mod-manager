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
        <Tooltip>{{ path.hint }}</Tooltip>
        {{ path.text }}
      </label>
      <button @click="promptNewFactorioPath({ type: path.variable })">
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

import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'PageOptions',
  computed: {
    ...mapState({
      options: 'options',
      pathOptions: 'pathOptions',
      active: state => state.environments.active,
      environments: state => state.environments.list,
    }),
    ...mapGetters({
      paths: 'currentEnvironmentPaths',
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
