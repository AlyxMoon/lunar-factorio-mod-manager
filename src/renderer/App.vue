<template>
  <div id="app">
    <ComponentNavbar />
    <RouterView class="content" />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar'

export default {
  name: 'App',
  components: {
    ComponentNavbar: Navbar,
  },
}
</script>

<style lang="scss">
@import './scss/_main.scss';

</style>
