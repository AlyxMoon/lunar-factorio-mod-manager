<template>
  <PanelContainer>
    <PanelContent>
      <AppOptions />
    </PanelContent>
  </PanelContainer>
</template>

<script>
import PanelContainer from '@/components/partials/PanelContainer'
import PanelContent from '@/components/partials/PanelContent'

import AppOptions from '@/components/AppOptions'

export default {
  name: 'PageOptions',
  components: {
    PanelContainer,
    PanelContent,
    AppOptions,
  },
}
</script>

<style lang="scss" scoped></style>
