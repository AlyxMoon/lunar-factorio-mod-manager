<template>
  <div class="page-portal">
    <div class="grid col-2 row-1">
      <OnlineModsListPanel />
      <OnlineModInfoPanel />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import OnlineModInfoPanel from '@/components/OnlineModInfoPanel'
import OnlineModsListPanel from '@/components/OnlineModsListPanel'

export default {
  name: 'Portal',
  components: {
    OnlineModInfoPanel,
    OnlineModsListPanel,
  },
  created () {
    this.fetchOnlineMods()
  },
  methods: {
    ...mapActions(['fetchOnlineMods']),
  },
}
</script>
