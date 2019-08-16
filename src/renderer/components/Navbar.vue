<template>
  <div class="menu">
    <nav class="menu-section nav">
      <router-link to="/profiles" class="btn">Profiles</router-link>
      <router-link to="/mods" class="btn">Mods</router-link>
      <router-link to="/saves" class="btn">Saves</router-link>
      <router-link to="/portal" class="btn">Mod Portal</router-link>
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

  .menu-section {
    &.nav {
      align-items: flex-end;
    }
  }

  .nav {
    .btn {
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

  .btn {
    background-color: $element-background-color;
    color: $text-primary-color;

    padding: 5px 10px;

    font-size: 16px;
    font-weight: bold;

    border-radius: 0;
    border: 1px solid $element-border-color;
    box-shadow: 1px 1px 2px 0 $element-shadow-color;
    outline: none;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      background-color: $highlight-color;
      border-color: rgba(0, 0, 0, 0);
      box-shadow: 0 0 2px 2px $highlight-color;
    }
  }
}
</style>
