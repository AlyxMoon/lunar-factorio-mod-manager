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
          <a
            :href="latestVersionLink"
            @click.prevent="openExternalLink(latestVersionLink)"
          >Latest Release: {{ appLatestVersion }}</a>

          <hr>
          <h4>About the app</h4>
          <p>This is geared towards both modders and casual users alike. I want people like me (who end up using many mod configurations and messing with them on a regular basis) to easily manage mods. So you can spend less time managing mods and focus on the important part: playing with them.</p>

          <hr>
          <h4>Helpful Links</h4>
          <ul>
            <li
              v-for="link of links"
              :key="link.href"
            >
              <a
                :href="link.href"
                @click.prevent="openExternalLink(link.href)"
              >{{ link.text }}</a>
            </li>
          </ul>

          <hr>
          <h4>Legal Stuff</h4>
          <p>Copyright {{ (new Date()).getFullYear() }}, Allister Moon</p>
          <p>Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.</p>
          <p>THE SOFTWARE IS PROVIDED 'AS IS' AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.</p>
        </PanelContent>
      </PanelContainer>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import PanelContent from '../components/partials/PanelContent'
import PanelContainer from '../components/partials/PanelContainer'

export default {
  name: 'About',
  components: { PanelContainer, PanelContent },
  data () {
    return {
      latestVersionLink: 'https://github.com/AlyxMoon/Lunars-Factorio-Mod-Manager/releases/latest',
      links: [
        {
          href: 'https://mods.factorio.com',
          text: 'The Official Mod Portal',
        },
        {
          href: 'https://forums.factorio.com/viewtopic.php?f=137&t=30394',
          text: 'Discussion thread on the Factorio forums',
        },
        {
          href: 'https://github.com/AlyxMoon/lunar-factorio-mod-manager',
          text: 'The Github repository',
        },
        {
          href: 'https://github.com/AlyxMoon/lunar-factorio-mod-manager/issues/new',
          text: 'Report an issue on the Github repository',
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['appVersion']),
    ...mapState({
      appLatestVersion: state => state.appLatestVersion,
    }),
  },
  created () {
    this.retrieveLatestAppVersion()
  },
  methods: {
    ...mapActions(['retrieveLatestAppVersion', 'openExternalLink']),
  },
}
</script>

<style lang="scss" scoped>
h1, h2, h3, h4, h5, h6 {
  color: $text-active-color;
  margin-bottom: 5px;
}

ul {
  color: $text-active-color;
  margin: 0;
}

a {
  color: $text-accent-color;

  &:hover, &:focus {
    color: darken($text-accent-color, 13);
    outline: none;
  }
}
</style>
