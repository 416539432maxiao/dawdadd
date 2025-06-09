<template>
  <div class="flex min-h-screen w-full p-8">
    <div class="flex w-full flex-col items-center justify-between gap-8">
      <div class="container px-0">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="block">
            <Logo />
          </NuxtLink>

          <div class="flex items-center justify-end gap-2">
            <ClientOnly>
              <ColorModeToggle />
            </ClientOnly>
          </div>
        </div>
      </div>

      <main class="w-full max-w-md">
        <slot />
      </main>

      <SaasFooter />
    </div>
  </div>
</template>
