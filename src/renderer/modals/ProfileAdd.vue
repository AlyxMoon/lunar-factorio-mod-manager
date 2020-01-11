<template>
  <ModalContainer
    v-on:confirm="addProfile(); hideModal()"
  >
    <template v-slot:title>
      Create New Profile
    </template>
    <template v-slot:content>
      <label>
        Profile Name:
        <input type="text">
      </label>
    </template>
  </ModalContainer>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import ModalContainer from './_ModalContainer'

export default {
  name: 'ModalProfileAdd',
  components: { ModalContainer },
  methods: {
    ...mapActions(['addProfile']),
    ...mapMutations({
      hideModal: 'HIDE_MODAL',
    }),
  },
}
</script>
