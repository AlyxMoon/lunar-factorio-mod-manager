<template>
  <ModalContainer
    v-on:confirm="addProfile({ name }); hideModal()"
    v-on:hidden="clearData"
  >
    <template v-slot:title>
      Create New Profile
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
import { mapActions, mapMutations } from 'vuex'
import ModalContainer from './_ModalContainer'

export default {
  name: 'ModalProfileAdd',
  components: { ModalContainer },
  data () {
    return {
      name: '',
    }
  },
  methods: {
    ...mapActions(['addProfile']),
    ...mapMutations({
      hideModal: 'HIDE_MODAL',
    }),
    clearData () {
      this.name = ''
    },
  },
}
</script>
