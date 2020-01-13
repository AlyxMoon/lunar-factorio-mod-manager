<template>
  <table>
    <thead><tr><slot name="headers" /></tr></thead>
    <tbody><slot name="body" /></tbody>
  </table>
</template>

<script>
export default {
  name: 'PartialTable',
}
</script>

<style lang="scss" scoped>

</style>
