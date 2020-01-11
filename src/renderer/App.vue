<template>
  <div id="app">
    <Toast position="ne" />

    <Navbar />

    <component
      v-for="comp of modals"
      :key="comp.name"
      :is="comp"
    />

    <RouterView class="content" />
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { Toast } from 'vuex-toast'
import Navbar from '@/components/Navbar'
import ModalProfileCreateOrEdit from '@/modals/ProfileCreateOrEdit'
import ModalProfileDelete from '@/modals/ProfileDelete'

export default {
  name: 'App',
  components: {
    Navbar,
    Toast,
  },
  data () {
    return {
      modals: [
        ModalProfileCreateOrEdit,
        ModalProfileDelete,
      ],
    }
  },
  created () {
    document.addEventListener('keydown', ({ keyCode }) => {
      if (keyCode === 27) { // ESC
        this.hideModal()
      }
    })
  },
  methods: {
    ...mapMutations({
      hideModal: 'HIDE_MODAL',
    }),
  },
}
</script>

<style lang="scss">
@import './scss/_main.scss';

</style>
