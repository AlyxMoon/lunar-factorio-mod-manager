import Vue from 'vue'

export const svgSearch = Vue.component('svg-search', { template: `
  <svg
    role="presentation"
    class="search"
    viewBox="0 0 32 32"
    width="13"
    height="13"
    stroke="currentcolor"
    stroke-width="4"
  >
    <circle cx="14" cy="14" r="12" />
    <path d="M23 23 L34 34" />
  </svg>
` })

export const svgX = Vue.component('svg-x', { template: `
  <svg
    role="presentation"
    class="x"
    viewBox="0 0 30 30"
    width="13"
    height="13"
    stroke="currentcolor"
    stroke-width="5"
  >
    <path d="M0 0 L30 30 M0 30 L 30 0" />
  </svg>
` })
