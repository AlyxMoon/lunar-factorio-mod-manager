<template>
  <div id="app">
    <Toast position="ne" />
    <Navbar />
    <RouterView class="content" />
  </div>
</template>

<script>
import { Toast } from 'vuex-toast'
import Navbar from '@/components/Navbar'

export default {
  name: 'App',
  components: {
    Navbar,
    Toast,
  },
}
</script>

<style lang="scss">
@import './scss/_main.scss';

</style>
