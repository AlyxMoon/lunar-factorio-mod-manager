<template>
  <div class="page-firstrun">
    <div class="container-wrapper">
      <PanelContainer>
        <PanelMenu>
          <template #menu-left>
            <h1>First Time Setup</h1>
          </template>
          <template #menu-right>
            <p>
              It looks like this is either your first time running the app or this version (2.3.0). To use all the features of this app it is necessary to get the paths on your filesystem for various Factorio folders/files. This app has attempted to automatically detect these paths. You can go with the defaults or manually choose these paths before continuing.
            </p>
          </template>
        </PanelMenu>

        <PanelContent>
          <AppOptions />
        </PanelContent>

        <PanelMenu position="bottom">
          <template #menu-right>
            <button @click="finishFirstRun">
              Save and Continue
            </button>
          </template>
        </PanelMenu>
      </PanelContainer>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import PanelContainer from '@/components/partials/PanelContainer'
import PanelMenu from '@/components/partials/PanelMenu'
import PanelContent from '@/components/partials/PanelContent'

import AppOptions from '@/components/AppOptions'

export default {
  name: 'PageFirstRun',
  components: {
    PanelContainer,
    PanelMenu,
    PanelContent,
    AppOptions,
  },
  methods: {
    ...mapActions(['finishFirstRun']),
  },
}
</script>

<style lang="scss" scoped>
.container-wrapper {
  position: fixed;
  z-index: 2;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  background-color: $background-secondary-color;
}

p {
  color: $text-light-color;
}

button {
  height: fit-content;
  padding: 5px 10px;
  font-size: 1.1em;
}

</style>
