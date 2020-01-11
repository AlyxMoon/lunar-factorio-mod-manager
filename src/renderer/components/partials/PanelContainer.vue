<template>
  <article class="panel-container">
    <slot />
  </article>
</template>

<script>
export default {
  name: 'PartialPanelContainer',
}
</script>

<style lang="scss" scoped>
article.panel-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  background-color: $background-secondary-color;
  border: 5px solid $background-primary-color;

  height: 100%;
  width: 100%;
}
</style>
