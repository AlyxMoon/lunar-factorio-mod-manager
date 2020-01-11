<template>
  <nav class="navbar">
    <div class="menu-section nav">
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
    </div>

    <div class="menu-section commands">
      <button
        @click="startFactorio()"
        class="btn"
      >
        Start Factorio
      </button>
    </div>
  </nav>
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
nav.navbar {
  height: $navbar-height-lg;
  width: 100%;
  padding: 5px;
  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  background-color: $background-primary-color;

  @media (max-width: $breakpoint-sm) {
    height: $navbar-height-sm;
  }

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
  }

  .menu-section {
    display: flex;
    flex-direction: row;

    margin: 0 5px;

    &.nav {
      align-items: flex-end;
      align-self: flex-end;
      margin-bottom: -5px;

      @media (max-width: $breakpoint-sm) {
        align-self: flex-start;
      }
    }

    &.commands {
      align-items: center;

      @media (max-width: $breakpoint-sm) {
        align-self: flex-start;
        order: -1;
        margin: 5px;
      }
    }
  }

  .nav .btn {
    box-shadow: none;
    border-bottom-width: 2px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    user-select: none;

    &:hover {
      box-shadow: 0 0 3px 2px $highlight-color;
    }

    &.router-link-active {
      border-bottom-color: $background-secondary-color;
      box-shadow: none;

      background-color: $background-secondary-color;
      color: $text-active-color;
    }
  }
}
</style>
