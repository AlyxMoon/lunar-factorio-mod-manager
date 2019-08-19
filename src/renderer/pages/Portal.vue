<template>
  <div class="page-portal">
    <div class="menu">
      <div class="menu-section">
        <span
          v-if="username"
          class="menu-label"
        >Logged In As: {{ username }}</span>
        <span
          v-else
          class="menu-label"
        >Player is not logged in</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Portal',
  computed: {
    ...mapState({
      username: state => state.username,
    }),
  },
}
</script>

<style lang="scss" scoped></style>
