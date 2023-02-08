<template>
  <header class="host h-20 flex justify-between text-slate-600">
    <div class="flex">
      <a href="/" class="flex justify-center items-center px-8 bg-primary/10">
        <img
          src="https://www.georchestra.org/public/georchestra-logo.svg"
          alt="geOrchestra logo"
          class="w-32"
        />
      </a>
      <nav class="flex justify-center items-center font-semibold">
        <a class="nav-item" href="/datahub/">Data</a
        ><a class="nav-item" href="/mviewer/">Simple Map</a
        ><a class="nav-item" href="/mapstore/">Advanced Map</a>
      </nav>
    </div>
    <div class="mr-8 flex justify-center items-center">
      <button type="button" class="btn">login</button>
    </div>
  </header>
</template>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

.host {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  tab-size: 4;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-feature-settings: normal;
}

@layer components {
  .nav-item {
    @apply px-6 hover:bg-primary/70 hover:text-slate-100 transition-colors leading-[5];
  }
  .btn {
    @apply px-4 py-2 text-slate-100 bg-primary rounded hover:bg-primary/70 transition-colors;
  }
}
</style>
