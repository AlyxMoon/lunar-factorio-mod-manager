<template>
  <div class="page-profiles">
    <div class="grid col-2 row-1">
      <ProfileViewPanel />

      <div class="grid col-1 row-2">
        <ComponentInstalledModsList />
        <ComponentModInfoPanel />
      </div>
    </div>
  </div>
</template>

<script>
import InstalledModsList from '@/components/InstalledModsList'
import ModInfoPanel from '@/components/ModInfoPanel'
import ProfileViewPanel from '@/components/ProfileViewPanel'

export default {
  name: 'Profiles',
  components: {
    ComponentInstalledModsList: InstalledModsList,
    ComponentModInfoPanel: ModInfoPanel,
    ProfileViewPanel,
  },
}
</script>

<style lang="scss" scoped></style>
