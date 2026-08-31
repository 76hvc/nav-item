<template>
  <nav class="menu-bar">
    <div
      v-for="menu in menus"
      :key="menu.id"
      class="menu-item"
      @mouseenter="showSubMenu(menu.id)"
      @mouseleave="hideSubMenu(menu.id)"
    >
      <button
        type="button"
        @click="selectMainMenu(menu)"
        :class="{active: menu.id === activeId}"
        :aria-haspopup="menu.subMenus?.length ? 'menu' : undefined"
        :aria-expanded="menu.subMenus?.length ? hoveredMenuId === menu.id : undefined"
      >
        <span class="menu-dot" :class="{ 'dot-active': menu.id === activeId }"></span>
        <span class="menu-label">{{ menu.name }}</span>
      </button>

      <!-- 二级菜单 -->
      <div
        v-if="menu.subMenus && menu.subMenus.length > 0"
        class="sub-menu"
        :class="{ 'show': hoveredMenuId === menu.id }"
      >
        <button
          v-for="subMenu in menu.subMenus"
          :key="subMenu.id"
          type="button"
          @click="selectSubMenu(subMenu, menu)"
          :class="{active: subMenu.id === activeSubMenuId}"
          class="sub-menu-item"
        >
          {{ subMenu.name }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  menus: { type: Array, default: () => [] },
  activeId: Number,
  activeSubMenuId: Number
});

const emit = defineEmits(['select']);

const hoveredMenuId = ref(null);

function showSubMenu(menuId) {
  hoveredMenuId.value = menuId;
}

function hideSubMenu(menuId) {
  // 延迟隐藏，给用户时间移动到子菜单
  setTimeout(() => {
    if (hoveredMenuId.value === menuId) {
      hoveredMenuId.value = null;
    }
  }, 150);
}

function selectMainMenu(menu) {
  emit('select', menu);
  if (menu.subMenus?.length && window.matchMedia('(hover: none)').matches) {
    hoveredMenuId.value = hoveredMenuId.value === menu.id ? null : menu.id;
  }
}

function selectSubMenu(subMenu, menu) {
  emit('select', subMenu, menu);
  hoveredMenuId.value = null;
}
</script>

<style scoped>
.menu-bar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 76rem;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  gap: 7px;
}

.menu-item {
  position: relative;
}

.menu-bar button {
  min-height: 42px;
  background: var(--bg-raised);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  padding: 0.58rem 1.35rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 12px;
  letter-spacing: 0.1px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.menu-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dot-active {
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

.menu-bar button:hover {
  color: var(--text-primary);
  background: var(--bg-overlay);
  border-color: var(--border-default);
  transform: translateY(-1px);
}

.menu-bar button.active {
  color: var(--text-primary);
  background: var(--accent-soft);
  border-color: rgba(111,145,232,0.28);
  box-shadow: inset 0 0 0 1px rgba(111,145,232,0.04);
}

/* ========== 二级菜单 ========== */
.sub-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  background: rgba(21,24,29,0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  min-width: 132px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1000;
  box-shadow: 0 18px 44px rgba(0,0,0,0.48);
  border: 1px solid var(--border-default);
  padding: 6px;
}

.sub-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.sub-menu-item {
  display: block !important;
  width: 100% !important;
  text-align: center !important;
  padding: 0.45rem 1.2rem !important;
  border: none !important;
  background: transparent !important;
  color: rgba(245,245,247,0.50) !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  border-radius: 8px !important;
  text-shadow: none !important;
  line-height: 1.5 !important;
  letter-spacing: 0.3px !important;
  transform: none !important;
}

.sub-menu-item:hover {
  background: var(--accent-soft) !important;
  color: var(--text-primary) !important;
}

.sub-menu-item.active {
  background: rgba(111,145,232,0.18) !important;
  color: var(--text-primary) !important;
  font-weight: 500 !important;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .menu-bar {
    justify-content: flex-start;
    gap: 6px;
    padding: 0 0.8rem;
  }
  .menu-bar button {
    font-size: 12px;
    min-height: 36px;
    padding: 0.36rem 0.75rem;
    border-radius: 9px;
  }
  .sub-menu {
    min-width: 100px;
    padding: 4px;
  }
  .sub-menu-item {
    font-size: 11px !important;
    padding: 0.3rem 0.8rem !important;
  }
}
</style>
