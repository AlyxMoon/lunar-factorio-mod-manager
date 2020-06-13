<template>
  <div class="page-options">
    <PanelContainer>
      <OptionMenu />

      <PanelContent>
        <AppOptions />
      </PanelContent>
    </PanelContainer>
  </div>
</template>

<script>
import PanelContainer from '@/components/partials/PanelContainer'
import PanelContent from '@/components/partials/PanelContent'

import AppOptions from '@/components/AppOptions'
import OptionMenu from './OptionMenu'

export default {
  name: 'PageOptions',
  components: {
    PanelContainer,
    PanelContent,
    AppOptions,
    OptionMenu,
  },
}
</script>

<style lang="scss" scoped>
.page-options {
  border: {
    bottom: none;
    left: none;
    right: none;
  };
}
</style>
