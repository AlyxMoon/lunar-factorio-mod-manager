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
        v-if="canLoadSaves"
        to="/saves"
        class="btn"
      >
        Saves
      </router-link>

      <div
        v-else
        class="btn disabled"
      >
        Saves
        <tooltip
          v-if="!canLoadSaves"
          position="bottom"
        >
          The saves directory has not been provided, so this is disabled.
        </tooltip>
      </div>

      <router-link
        to="/portal"
        class="btn"
      >
        Mod Portal
      </router-link>

      <router-link
        to="/options"
        class="btn"
      >
        Options
      </router-link>

      <router-link
        to="/about"
        class="btn"
      >
        About
      </router-link>
    </div>

    <div class="menu-section commands">
      <button
        class="btn"
        :disabled="!canStartFactorio"
        @click="startFactorio()"
      >
        Start Factorio
        <tooltip
          v-if="!canStartFactorio"
          position="left"
        >
          Factorio Exe has not been provided, so this is disabled.
        </tooltip>
      </button>
    </div>
  </nav>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import Tooltip from '@/components/partials/Tooltip'

export default {
  name: 'Navbar',
  components: {
    Tooltip,
  },
  computed: {
    ...mapGetters(['canLoadSaves', 'canStartFactorio']),
  },
  methods: {
    ...mapActions(['startFactorio']),
  },
}
</script>

<style lang="scss" scoped>
nav.navbar {
  position: relative;
  z-index: 2;

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
    -webkit-user-drag: none;

    height: auto;
    margin: 0 1px;

    &:hover:not(:disabled):not(.disabled) {
      border-color: $highlight-color;
      box-shadow: 0 0 3px 2px $highlight-color;
    }

    &.router-link-active {
      border-color: $element-border-color;
      border-bottom-color: $background-secondary-color;
      box-shadow: none;

      background-color: $background-secondary-color;
      color: $text-active-color;
    }

    &.disabled {
      background-color: rgba($element-background-color, 0.5);
      color: rgba($text-light-color, 0.5);
    }
  }
}
</style>
