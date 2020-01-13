<template>
  <menu :class="[`panel-menu ${position}`, { border: border }]">
    <div class="menu-left">
      <slot name="menu-left" />
    </div>
    <div class="menu-center">
      <slot name="menu-center" />
    </div>
    <div class="menu-right">
      <slot name="menu-right" />
    </div>
  </menu>
</template>

<script>
export default {
  name: 'PartialPanelMenu',
  props: {
    position: {
      type: String,
      default: 'top',
      validator: (val) => ['top', 'middle', 'bottom'].includes(val),
    },
    border: {
      type: Boolean,
      default: true,
    },
  },
}
</script>

<style lang="scss" scoped>
menu.panel-menu {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  box-sizing: border-box;
  margin: 0;
  padding: 3px 5px;
  width: 100%;

  background-color: $background-primary-color;
  color: $text-active-color;

  div {
    margin: 3px 0;
  }

  .menu-left, .menu-center, .menu-right {
    display: flex;
    align-items: center;

    & > *:not(:last-child) {
      margin-right: 4px;
    }
  }

  &.border {
    border-color: $highlight-color;
    border-style: solid;
    border-width: 0;

    &.top, &.middle {
      border-bottom-width: 2px;
    }

    &.bottom, &.middle {
      border-top-width: 2px;
    }
  }

  &.compact {
    padding: 0 5px;
    min-height: 0;
  }
}
</style>
