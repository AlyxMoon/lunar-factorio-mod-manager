<template>
  <div class="page-profiles">
    <div
      v-if="editingProfile"
      class="grid col-1 row-1"
    >
      <ProfileEditPanel v-if="editingProfile" />
    </div>
    <div
      v-else
      class="grid col-2 row-1"
    >
      <ProfileViewPanel />

      <div class="grid col-1 row-2">
        <InstalledModsList />
        <ModInfoPanel />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import InstalledModsList from '@/components/InstalledModsList'
import ModInfoPanel from '@/components/ModInfoPanel'
import ProfileEditPanel from '@/components/ProfileEditPanel'
import ProfileViewPanel from '@/components/ProfileViewPanel'

export default {
  name: 'Profiles',
  components: {
    InstalledModsList,
    ModInfoPanel,
    ProfileEditPanel,
    ProfileViewPanel,
  },
  computed: {
    ...mapState({
      editingProfile: state => state.editingProfile,
    }),
  },
}
</script>

<style lang="scss" scoped></style>
