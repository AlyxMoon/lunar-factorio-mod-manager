<template>
  <ModalContainer
    :disable-footer="exporting || importing"
    @confirm="handleConfirm(); hideModal()"
    @hidden="clearData"
  >
    <template v-slot:title>
      <span v-if="editing">Edit Profile | {{ originalName }}</span>
      <span v-else>Create New Profile</span>
    </template>
    <template v-slot:content>
      <div>
        <label>
          Profile Name:
          <input
            v-model="name"
            type="text"
          >
        </label>
      </div>

      <button
        v-if="editing"
        class="btn mt-2"
        :disabled="exporting"
        @click="handleExport"
      >
        <i
          v-if="exporting"
          class="fa fa-cog fa-spin"
        />
        Export profile
      </button>
      <button
        v-else
        class="btn mt-2"
        :disabled="importing"
        @click="handleImport"
      >
        <i
          v-if="importing"
          class="fa fa-cog fa-spin"
        />
        Import profile
      </button>
    </template>

    <template v-slot:confirm-text>
      {{ editing ? 'Save' : 'Create' }}
    </template>
  </ModalContainer>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import ModalContainer from './_ModalContainer'

export default {
  name: 'ModalProfileCreateOrEdit',
  components: { ModalContainer },
  data () {
    return {
      exporting: false,
      importing: false,
      name: '',
      originalName: '',
    }
  },
  computed: {
    ...mapState({
      editing: state => state.modals.ModalProfileCreateOrEdit.mode === 'edit',
    }),
  },
  watch: {
    editing: function (edit) {
      if (edit) {
        this.name = this.originalName = this.$store.getters.currentProfile.name
      }
    },
  },
  methods: {
    ...mapActions(['addProfile', 'exportProfile', 'importProfile', 'updateCurrentProfile']),
    ...mapMutations({
      hideModal: 'HIDE_MODAL',
    }),
    clearData () {
      this.name = ''
      this.originalName = ''
      this.exporting = false
      this.importing = false
    },
    handleConfirm () {
      if (this.editing) {
        this.updateCurrentProfile({ name: this.name })
      } else {
        this.addProfile({ name: this.name })
      }
    },
    async handleExport () {
      this.exporting = true
      await this.exportProfile()
      this.exporting = false
    },
    async handleImport () {
      this.importing = true
      await this.importProfile()
      this.hideModal()
      this.importing = false
    },
  },
}
</script>
