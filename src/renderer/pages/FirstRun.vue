<template>
  <div class="page-firstrun">
    <div class="container-wrapper">
      <h1>First Time Setup</h1>
      <p>
        It looks like this is either your first time running the app or this version (2.3.0). To use all the features of this app it is necessary to get the paths on your filesystem for various Factorio folders/files. This app has attempted to automatically detect these paths. You can go with the defaults or manually choose these paths before continuing.
      </p>

      <form>
        <div
          v-for="path of pathOptions"
          :key="'path-' + path.variable"
          class="input-group"
        >
          <label>{{ path.text }}</label>
          <button @click="promptNewFactorioPath(path.variable)">
            Change
          </button>
          <input
            type="text"
            :value="paths[path.variable]"
            disabled
          >
        </div>
      </form>

      <button @click="finishFirstRun">
        Continue
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'PageFirstRun',
  data: () => ({
    pathOptions: [
      { text: 'Factorio Exe Path', variable: 'factorioExe' },
      { text: 'Mods Folder Path', variable: 'modDir' },
      { text: 'PlayerData File Path', variable: 'playerDataFile' },
      { text: 'Saves Folder Path', variable: 'saveDir' },
    ],
  }),
  computed: {
    ...mapState({
      options: 'options',
      paths: 'paths',
    }),
  },
  methods: {
    ...mapActions(['promptNewFactorioPath', 'finishFirstRun']),
  },
}
</script>

<style lang="scss" scoped>
.container-wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  padding: 5%;

  background-color: $background-primary-color;

  h1 {
    border-bottom: 2px solid $highlight-color;
    margin-bottom: 20px;

    color: $text-active-color;
  }

  form {
    margin: 30px 0;
  }
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
</style>
