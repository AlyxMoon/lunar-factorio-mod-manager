<template>
  <ModalContainer
    v-on:confirm="handleConfirm(); hideModal()"
    v-on:hidden="clearData"
  >
    <template v-slot:title>
      <span v-if="editing">Edit Profile | {{ originalName }}</span>
      <span v-else>Create New Profile</span>
    </template>
    <template v-slot:content>
      <label>
        Profile Name:
        <input
          v-model="name"
          type="text"
        >
      </label>
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
      name: '',
      originalName: '',
    }
  },
  computed: {
    ...mapState({
      editing: state => state.modals.ModalProfileCreateOrEdit === 'edit',
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
    ...mapActions(['addProfile', 'updateCurrentProfile']),
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
  },
}
</script>
