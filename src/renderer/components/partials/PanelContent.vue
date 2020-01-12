<template>
  <section class="panel-content">
    <slot />
  </section>
</template>

<script>
export default {
  name: 'PartialPanelContent',
}
</script>

<style lang="scss" scoped>
section.panel-content {
  flex-grow: 1;

  box-sizing: border-box;
  overflow-y: auto;

  padding: 5px 10px;

  @include custom-scrollbar;

  &.full {
    padding: 0;
  }
}

</style>
