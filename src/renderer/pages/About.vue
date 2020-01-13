<template>
  <div class="page-about">
    <div class="grid col-1 row-1">
      <PanelContainer>
        <PanelContent>
          <h3>Lunar's Factorio Mod Manager</h3>
          <h4>By: Allister Moon</h4>
          <hr>
          <h4 class="appCurrentVersion">
            Current Version: {{ appVersion }}
          </h4>
          <a href="https://github.com/AlyxMoon/Lunars-Factorio-Mod-Manager/releases/latest">
            Latest Release Version: {{ appLatestVersion }}
          </a>

          <hr>
          <h4>About LMM</h4>
          <p>This is geared towards both modders and casual users alike. I want people like me (who end up using many mod configurations and messing with them on a regular basis) to easily manage mods. So you can spend less time managing mods and focus on the important part: playing with them.</p>

          <hr>
          <h4>Helpful Links</h4>
          <a href="https://mods.factorio.com">
            Official Mod Portal (Unaffiliated with this app)
          </a>
          <a href="https://forums.factorio.com/viewtopic.php?f=137&t=30394">
            Check it out on the Factorio Forums
          </a>
          <a href="https://github.com/AlyxMoon/Lunars-Factorio-Mod-Manager">
            Check out the Github Repo
          </a>
          <a href="https://github.com/AlyxMoon/Lunars-Factorio-Mod-Manager/issues/new">
            Report an issue on the Github Repo
          </a>

          <hr>
          <h4>Legal Stuff</h4>
          <p>Copyright (c) {{ (new Date()).getFullYear() }}, Allister Moon</p>
          <p>Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.</p>
          <p>THE SOFTWARE IS PROVIDED 'AS IS' AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.</p>
        </PanelContent>
      </PanelContainer>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PanelContent from '../components/partials/PanelContent'
import PanelContainer from '../components/partials/PanelContainer'

export default {
  name: 'About',
  components: { PanelContainer, PanelContent },
  data () {
    return {
      appLatestVersion: '0',
    }
  },
  computed: {
    ...mapGetters(['appVersion']),
  },
}
</script>

<style lang="scss" scoped>
h1, h2, h3, h4, h5, h6 {
  color: $text-active-color;
  margin-bottom: 5px;
}

a {
  color: $text-accent-color;
  display: block;

  &:hover, &:focus {
    color: darken($text-accent-color, 13);
    outline: none;
  }
}
</style>
