<template>
  <div class="page-saves">
    <div class="grid col-2 row-1">
      <SavesListPanel />
      <SavesInfoPanel />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import SavesInfoPanel from '../components/SavesInfoPanel'
import SavesListPanel from '../components/SavesListPanel'

export default {
  name: 'Saves',
  components: { SavesInfoPanel, SavesListPanel },
  mounted () {
    this.retrieveSaves()
  },
  methods: {
    ...mapActions(['retrieveSaves']),
  },
}
</script>
