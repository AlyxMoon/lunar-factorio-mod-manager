<template>
  <div class="page-saves">
    <div class="grid col-2 row-1">
      <SavesListPanel />
      <SavesInfoPanel />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import SavesInfoPanel from '../components/SavesInfoPanel'
import SavesListPanel from '../components/SavesListPanel'

export default {
  name: 'Saves',
  components: { SavesInfoPanel, SavesListPanel },
  computed: {
    ...mapState({
      saves: state => state.saves,
    }),
  },
  mounted () {
    if (!this.saves) this.retrieveSaves()
  },
  methods: {
    ...mapActions(['retrieveSaves']),
  },
}
</script>
