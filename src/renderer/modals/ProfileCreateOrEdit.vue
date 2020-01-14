<template>
  <ModalContainer
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
    ...mapActions(['addProfile', 'exportProfile', 'updateCurrentProfile']),
    ...mapMutations({
      hideModal: 'HIDE_MODAL',
    }),
    clearData () {
      this.name = ''
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
  },
}
</script>
