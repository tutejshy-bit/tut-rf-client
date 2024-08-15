<template>
  <div class="container mx-auto max-w-[800px]">
    <Menubar :model="menuItems">
      <template #item="{ item, props }">
        <router-link v-slot="{ href }" :to="item.path">
          <a :href="item.path" v-bind="props.action">
            <e-icon :icon="item.icon" size="small" />
            <span class="top-menu-item">{{ item.name }}</span>
          </a>
        </router-link>
      </template>
      <template #end>
      <AdvancedMode/>
      </template>
    </Menubar>

    <div class="align-middle mt-5" v-if="store.state.connected">
      <Cc1101Status v-for="module in store.cc1101Modules" :num="module.id" />
    </div>

  </div>
  <router-view />
  <Toast position="top-right" />
</template>

<script>
import AdvancedMode from '@/components/AdvancedMode.vue'
import Cc1101Status from '@/components/Cc1101Status.vue'
import { useStore } from '@/store/store'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

export default {
  components: { AdvancedMode },
  setup() {
    const store = useStore();
    const router = useRouter();
    const menuItems = ref([]);
    const currentRoute = router.currentRoute;

    const mapRoutesToMenuItems = (routes) => {
      return routes.map((route) => {
        return {
          name: route.name,
          path: route.path,
          icon: route.meta.icon,
          items: route.children ? mapRoutesToMenuItems(route.children) : []
        }
      })
    }

    const routes = router.getRoutes().filter(route => route.path !== '/');
    menuItems.value = mapRoutesToMenuItems(routes);

    const isActive = (item) => {
      return item.path === currentRoute.value.path;
    }

    return { store, router, menuItems, isActive }
  }
}
</script>

<style>
.top-menu-item {
  margin-left: 6px;
}
</style>
