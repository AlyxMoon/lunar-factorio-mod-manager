<template>
  <ModalContainer
    @confirm="createEnvironment({ name, paths }); hideModal()"
    @hidden="clearData()"
  >
    <template #title>
      Create new environment
    </template>
    <template #content>
      <form @submit.prevent>
        <label>
          Environment Name:
          <input
            v-model="name"
            type="text"
          >
        </label>

        <h2>Factorio Paths</h2>
        <div
          v-for="option of pathOptions"
          :key="'path-' + option.variable"
          class="input-group"
        >
          <label>
            <Tooltip>{{ option.hint }}</Tooltip>
            {{ option.text }}
          </label>
          <button @click="promptPath(option.variable)">
            Change
          </button>
          <input
            type="text"
            :value="paths[option.variable]"
            disabled
          >
        </div>
      </form>
    </template>

    <template #confirm-text>
      Create
    </template>
  </ModalContainer>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import ModalContainer from './_ModalContainer'

export default {
  name: 'ModalEnvironmentCreate',
  components: { ModalContainer },
  data: () => ({
    name: '',
    paths: {},
  }),
  computed: {
    ...mapGetters(['defaultEnvironment']),
    ...mapState({
      pathOptions: 'pathOptions',
    }),
  },

  created () {
    this.clearData()
  },

  methods: {
    ...mapActions(['createEnvironment', 'promptNewFactorioPath']),
    ...mapMutations({
      hideModal: 'HIDE_MODAL',
    }),

    clearData () {
      this.name = ''
      this.paths = { ...(this.defaultEnvironment || {}).paths }
    },

    async promptPath (type) {
      this.paths[type] = await this.promptNewFactorioPath({ type, save: false })
    },
  },
}
</script>

<style lang="scss" scoped>
form input {
  margin-top: 5px;
  margin-bottom: 20px;
  padding: 15px;
  width: fit-content;
}
</style>
