<template>
  <div class="profile-edit-panel">
    <div class="menu">
      <div />
      <div class="menu-section commands">
        <button
          @click="toggleEditProfile()"
          class="btn green"
        >
          Finish Editing
        </button>
      </div>
    </div>

    <div class="profile-edit-content">
      <hr>
      <label>Profile Name</label>
      <input
        v-model="name"
        type="text"
      >
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ProfileEditPanel',
  computed: {
    name: {
      get () {
        return this.$store.getters.currentProfile.name
      },
      set (value) {
        this.$store.dispatch('updateCurrentProfile', { name: value })
      },
    },
  },
  methods: {
    ...mapActions(['toggleEditProfile']),
  },
}
</script>

<style lang="scss" scoped>
.profile-edit-panel {
  background-color: $background-secondary-color;
  border: 5px solid $background-primary-color;

  .profile-edit-content {
    height: calc(100% - 40px);
    padding: 0 10px;

    overflow-y: auto;
  }
}
</style>
