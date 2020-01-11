<template>
  <div
    :class="{ transparent: !visible }"
    class="modal-overlay"
  >
    <transition name="zoom">
      <div
        v-if="visible"
        class="modal-container"
      >
        <div class="modal-menu">
          <div class="modal-title">
            <slot name="title">
              title
            </slot>
          </div>
          <button
            @click="hideModal"
            class="btn subtle"
          >
            X
          </button>
        </div>
        <hr class="mt-0">

        <div class="modal-content">
          <slot name="content">
            content
          </slot>
        </div>
        <hr class="mb-0">

        <div class="modal-footer">
          <slot name="footer">
            <button
              @click="$emit('confirm')"
              class="btn green small"
            >
              Confirm
            </button>
            <button
              @click="hideModal"
              class="btn red small"
            >
              Cancel
            </button>
          </slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'ModalContainer',
  computed: {
    visible: {
      get () {
        return this.$store.state.modals[this.$parent.$vnode.key]
      },
    },
  },
  methods: {
    ...mapMutations({
      hideModal: 'HIDE_MODAL',
    }),
  },
}
</script>

<style lang="scss">
.modal-overlay {
  @include absolute;
  background-color: #111111AA;
  display: flex;
  justify-content: center;
  align-items: center;

  &.transparent {
    background-color: transparent;
    pointer-events: none;
  }
}

.modal-container {
  background-color: $background-primary-color;
  border: 2px solid $element-border-color;
  border-radius: 10px;
  box-shadow: 0 0 10px 8px $element-shadow-color;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 500px;
  min-height: 400px;
  padding: 0 10px;

  hr {
    border-color: $highlight-color;
    margin: 0 -10px;
  }
}

.modal-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;

  button {
    color: $text-light-color;
    margin-top: -5px;
    margin-right: -5px;
  }
}

.modal-content {
  flex-grow: 1;
  padding: 10px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 5px 0;

  button {
    margin: 0 5px;
  }
}
</style>
