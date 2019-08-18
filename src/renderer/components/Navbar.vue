<template>
  <div class="menu">
    <nav class="menu-section nav">
      <router-link
        to="/profiles"
        class="btn"
      >
        Profiles
      </router-link>
      <router-link
        to="/mods"
        class="btn"
      >
        Mods
      </router-link>
      <router-link
        to="/saves"
        class="btn"
      >
        Saves
      </router-link>
      <router-link
        to="/portal"
        class="btn"
      >
        Mod Portal
      </router-link>
    </nav>
    <div class="menu-section commands">
      <button
        @click="startFactorio()"
        class="btn"
      >
        Start Factorio
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Navbar',
  methods: {
    ...mapActions(['startFactorio']),
  },
}
</script>

<style lang="scss" scoped>
.menu {
  height: $navbar-height-lg;

  @media (max-width: $breakpoint-sm) {
    height: $navbar-height-sm;
  }
}
</style>
