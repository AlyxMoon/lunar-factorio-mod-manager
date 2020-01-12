<template>
  <div class="page-profiles">
    <div class="grid col-2 row-1">
      <ProfileViewPanel />

      <div class="grid col-1 row-2">
        <InstalledModsListPanel />
        <InstalledModsInfoPanel />
      </div>
    </div>
  </div>
</template>

<script>
import InstalledModsListPanel from '@/components/InstalledModsListPanel'
import InstalledModsInfoPanel from '@/components/InstalledModsInfoPanel'
import ProfileViewPanel from '@/components/ProfileViewPanel'

export default {
  name: 'Profiles',
  components: {
    InstalledModsListPanel,
    InstalledModsInfoPanel,
    ProfileViewPanel,
  },
}
</script>
