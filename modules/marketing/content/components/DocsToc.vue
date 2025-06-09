<template>
  <nav
    class="w-full space-y-1.5"
    aria-label="Table of contents"
    v-show="toc?.length"
  >
    <h4 class="mb-4 text-sm font-medium text-muted-foreground">目录</h4>
    <div class="space-y-1">
      <div v-for="link in toc" :key="link.id">
        <a
          :href="`#${link.id}`"
          class="flex py-1 text-sm transition-colors rounded-md"
          :class="[
            activeId === link.id
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground',
            {
              'pl-4': link.depth === 2,
              'pl-6': link.depth === 3,
            },
          ]"
          @click.prevent="scrollToElement(link.id)"
        >
          {{ link.text }}
        </a>
        <!-- 添加嵌套的子目录 -->
        <div v-if="link.children" class="ml-4">
          <div v-for="child in link.children" :key="child.id">
            <a
              :href="`#${child.id}`"
              class="flex py-1 text-sm transition-colors rounded-md"
              :class="[
                activeId === child.id
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground',
                {
                  'pl-4': child.depth === 2,
                  'pl-6': child.depth === 3,
                },
              ]"
              @click.prevent="scrollToElement(child.id)"
            >
              {{ child.text }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  toc: any[];
}>();

const activeId = ref("");
const HEADER_HEIGHT = 80;
const router = useRouter();
let observer: IntersectionObserver | null = null;

const scrollToElement = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - HEADER_HEIGHT;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

const isElementInViewport = (element: Element) => {
  const rect = element.getBoundingClientRect();
  const rootMargin = HEADER_HEIGHT;

  return (
    rect.top >= -rect.height &&
    rect.top <=
      (window.innerHeight || document.documentElement.clientHeight) - rootMargin
  );
};

const updateActiveHeader = () => {
  const headers: Element[] = [];
  props.toc.forEach((item) => {
    const element = document.getElementById(item.id);
    if (element) headers.push(element);

    if (item.children) {
      item.children.forEach((child: any) => {
        const childElement = document.getElementById(child.id);
        if (childElement) headers.push(childElement);
      });
    }
  });

  const visibleHeader = headers.find((header) => isElementInViewport(header));
  if (visibleHeader) {
    activeId.value = visibleHeader.id;
  }
};

const initializeObserver = () => {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id;
        }
      });
    },
    {
      rootMargin: `-${HEADER_HEIGHT}px 0px -80% 0px`,
      threshold: 0,
    }
  );

  props.toc.forEach((item) => {
    const element = document.getElementById(item.id);
    if (element && observer) {
      observer.observe(element);
    }

    if (item.children) {
      item.children.forEach((child: any) => {
        const childElement = document.getElementById(child.id);
        if (childElement && observer) {
          observer.observe(childElement);
        }
      });
    }
  });

  nextTick(() => {
    updateActiveHeader();
  });
};

onMounted(() => {
  initializeObserver();
  window.addEventListener("scroll", updateActiveHeader);
});

watch(
  () => router.currentRoute.value.path,
  () => {
    nextTick(() => {
      initializeObserver();
    });
  }
);

watch(
  () => props.toc,
  () => {
    nextTick(() => {
      initializeObserver();
    });
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
  window.removeEventListener("scroll", updateActiveHeader);
});
</script>

<style>
:target {
  scroll-margin-top: v-bind('HEADER_HEIGHT + "px"');
}
</style>
