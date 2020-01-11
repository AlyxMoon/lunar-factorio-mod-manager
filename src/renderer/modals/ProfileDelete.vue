<template>
  <ModalContainer
    v-on:confirm="removeCurrentProfile(); hideModal()"
  >
    <template v-slot:title>
      Delete this profile?
    </template>
    <template v-slot:content>
      <p>Current Profile: {{ currentProfile.name }}</p>
      <p>Confirm whether to delete this profile.</p>
    </template>
  </ModalContainer>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import ModalContainer from './_ModalContainer'

export default {
  name: 'ModalProfileDelete',
  components: { ModalContainer },
  computed: {
    ...mapGetters(['currentProfile']),
  },
  methods: {
    ...mapActions(['removeCurrentProfile']),
    ...mapMutations({
      hideModal: 'HIDE_MODAL',
    }),
  },
}
</script>
