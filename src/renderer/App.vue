<template>
  <div
    id="app"
    class="container-fluid"
  >
    <!-- <keep-alive> -->
    <RouterView />
    <!-- </keep-alive> -->
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'App',
})
</script>
