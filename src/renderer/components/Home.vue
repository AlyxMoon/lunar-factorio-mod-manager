<template>
  <div>
    <nav class="menu">
      <button
        @click="startFactorio()"
        class="btn btn-primary"
      >
        Start Factorio
      </button>
    </nav>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Home',
  methods: {
    ...mapActions(['startFactorio']),
  },
}
</script>
