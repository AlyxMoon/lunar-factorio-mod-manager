<template>
  <span class="tooltip">
    <i
      class="fa"
      :class="{
        'fa-info-circle': icon === 'info',
        'fa-exclamation-circle': icon === 'warning',
      }"
      @mouseenter="show = true"
      @mouseleave="show = false"
    />

    <transition name="fade-right">
      <div
        v-if="show"
        :class="position"
      >
        <slot />
      </div>
    </transition>
  </span>
</template>

<script>
export default {
  name: 'PartialTooltip',
  props: {
    icon: {
      type: String,
      default: 'info',
      validator: (value) => ['info', 'warning'].indexOf(value) > -1,
    },
    position: {
      type: String,
      default: 'right',
      validator: (value) => ['top', 'bottom', 'left', 'right'].indexOf(value) > -1,
    },
  },
  data: () => ({
    show: false,
  }),
}
</script>

<style lang="scss" scoped>
$arrow-size: 20px;

.tooltip {
  position: relative;

  margin: 0 5px;

  i {
    transition-duration: 0.3s;
    cursor: help;
  }

  &:hover {
    i {
      color: $text-light-color;
    }
  }

  div {
    position: absolute;
    z-index: 100;

    max-width: 90vw;
    width: 400px;
    min-height: 50px;
    padding: 10px;

    border-radius: 5px;

    background-color: $background-primary-color;
    box-shadow: 0 0 3px 3px $background-primary-color;
    color: $text-light-color;
    font-size: 16px;
    font-weight: normal;

    &:before {
      content: "";
      display: block;
      position: absolute;
      z-index: 100;
    }

    &.left {
      right: 30px;
      top: -10px;

      &:before {
        right: -13px;
        top: 0;

        border: none {
          left: $arrow-size solid $background-primary-color;
          top: $arrow-size solid transparent;
          bottom: $arrow-size solid transparent;
        }
      }
    }

    &.right {
      left: 30px;
      top: -10px;

      &:before {
        left: -13px;
        top: 0;

        border: none {
          right: $arrow-size solid $background-primary-color;
          top: $arrow-size solid transparent;
          bottom: $arrow-size solid transparent;
        }
      }
    }

    &.bottom {
      top: 30px;
      left: -11px;

      &:before {
        top: -13px;
        left: 0;

        border: none {
          bottom: $arrow-size solid $background-primary-color;
          left: $arrow-size solid transparent;
          right: $arrow-size solid transparent;
        }
      }
    }
  }
}
</style>
