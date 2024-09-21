<template>
  <div class="container mx-auto max-w-[800px]">
    <Menubar :model="menuItems">
      <template #item="{ item, props }">
        <router-link :to="item.path" activeClass="active" v-show="(item.advanced && store.state.advancedMode) || (!item.advanced)">
          <a :href="item.path" v-bind="props.action">
            <e-icon :icon="item.icon" class="mt-1" size="small" />
            <span class="top-menu-item">{{ item.name }}  </span>
          </a>
        </router-link>
      </template>
      <template #end>
      <AdvancedMode/>
      </template>
    </Menubar>
  </div>
  <router-view />
  <Toast position="top-right" />
</template>

<script>
import AdvancedMode from '@/components/AdvancedMode.vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/store/store'
import { ref } from 'vue'

export default {
  components: { AdvancedMode },
  setup() {
    const router = useRouter();
    const store = useStore();
    const menuItems = ref([]);
    const currentRoute = router.currentRoute;

    const mapRoutesToMenuItems = (routes) => {
      return routes.map((route) => {
        return {
          name: route.name,
          path: route.path,
          icon: route.meta.icon,
          advanced: route.meta.advanced,
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

<style scoped>
.top-menu-item {
  margin-left: 6px;
}

.active {
  text-decoration: none;
}

.p-menubar .p-menuitem > .p-menuitem-content > .active > .p-menuitem-link {
  color: green;
  border: 1px green;
  border-style: dashed;
  border-radius: 10px;
}

.active .top-menu-item {
  text-decoration: none;
}
</style>
