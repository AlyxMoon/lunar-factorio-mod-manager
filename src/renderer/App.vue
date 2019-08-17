<template>
  <div id="app">
    <ComponentNavbar />
    <RouterView class="content" />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar'

export default {
  name: 'App',
  components: {
    ComponentNavbar: Navbar,
  },
}
</script>

<style lang="scss">
html, body {
  background-color: $background-primary-color;

  margin: 0;
  padding: 0;

  font-size: 16px;
  font-weight: bold;

  overflow: hidden;
}

.content {
  border: 10px solid $background-secondary-color;
  box-sizing: border-box;

  width: 100vw;
  height: calc(100vh - #{$navbar-height-lg});

  overflow: hidden;

  @media- (max-width: $breakpoint-sm) {
    height: calc(100vh - 10px - #{$navbar-height-sm});
  }
}

.menu {
  background-color: $background-primary-color;

  height: $menu-height;
  width: 100%;
  padding: 5px;
  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
  }

  .menu-section {
    display: flex;
    flex-direction: row;

    margin: 0 5px;

    &.commands {
      align-items: center;

      @media (max-width: $breakpoint-sm) {
        order: -1;
        margin: 5px 0;
      }
    }
  }

  .menu-label {
    color: $text-active-color;
  }
}

table {
  width: 100%;

  background-color: $background-primary-color;
  color: $text-light-color;

  text-align: left;

  border-collapse: collapse;

  td, th {
    padding: 5px 10px;
    box-shadow: inset 0 0 5px 1px $background-secondary-color;
  }

  th {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  td {
    user-select: none;
  }

  tbody {
    tr {
      &:hover {
        background-color: $highlight-color;

        td:not(:first-child) {
          border-left-color: white;
        }
      }
    }
  }

  .cell-check {
    padding-left: 10px;
    padding-right: 10px;
    width: 15px;
    text-align: center;

    .btn {
      font-size: 12px;
      padding: 5px;
    }
  }
}

.btn {
  background-color: $element-background-color;
  color: $text-primary-color;

  padding: 5px 10px;

  font-size: 16px;
  font-weight: bold;

  border-radius: 0;
  border: 1px solid $element-border-color;
  box-shadow: 1px 1px 2px 0 $element-shadow-color;
  outline: none;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background-color: $highlight-color;
    border-color: rgba(0, 0, 0, 0);
    box-shadow: 0 0 2px 2px $highlight-color;
  }

  &.btn-green {
    background-color: #28A745;
    color: $text-light-color;
  }

  &.btn-red {
    background-color: #CB2431;
    color: $text-light-color;
  }

  &:disabled {
    background-color: $background-secondary-color;
    border-color: rgba(0, 0, 0, 0);
    box-shadow: 0 0 2px 2px $element-shadow-color;
    cursor: default;
  }
}

select {
  display: inline-block;
  padding: 4px 10px;

  background-color: $element-background-color;

  font-size: 16px;
  font-weight: bold;

  &:hover, &:focus {
    background-color: $highlight-color;
    border-color: rgba(0, 0, 0, 0);
    box-shadow: 0 0 2px 2px $highlight-color;
  }

  option {
    color: $text-light-color;
    font-size: 16px;

    background-color: $background-primary-color;
    border-bottom: 1px solid black;

    &:hover {
      background-color: $highlight-color;
      border-color: rgba(0, 0, 0, 0);
    }
  }
}
</style>
