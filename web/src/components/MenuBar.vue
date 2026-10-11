<template>
  <nav class="menu-bar" aria-label="网站分类" @keydown.esc="closeSubMenu">
    <div
      v-for="menu in menus"
      :key="menu.id"
      class="menu-item"
      @mouseenter="showSubMenu(menu.id)"
      @mouseleave="hideSubMenu(menu.id)"
      @focusin="showSubMenu(menu.id)"
      @focusout="handleFocusOut(menu.id, $event)"
    >
      <button
        @click="handleMenuClick(menu)"
        :aria-haspopup="menu.subMenus && menu.subMenus.length ? 'true' : undefined"
        :aria-expanded="menu.subMenus && menu.subMenus.length ? hoveredMenuId === menu.id : undefined"
        :aria-controls="menu.subMenus && menu.subMenus.length ? 'submenu-' + menu.id : undefined"
        :class="{active: menu.id === activeId}"
      >
        <span class="menu-dot" :class="{ 'dot-active': menu.id === activeId }"></span>
        <span class="menu-label">{{ menu.name }}</span>
      </button>

      <!-- 二级菜单 -->
      <div
        v-if="menu.subMenus && menu.subMenus.length > 0"
        :id="'submenu-' + menu.id"
        role="group"
        class="sub-menu"
        :class="{ 'show': hoveredMenuId === menu.id }"
      >
        <button
          v-for="subMenu in menu.subMenus"
          :key="subMenu.id"
          @click="selectSubMenu(subMenu, menu)"
          :class="{active: subMenu.id === activeSubMenuId}"
          class="sub-menu-item"
        >
          {{ subMenu.name }}
        </button>
      </div>
    </div>

    <button
      class="theme-switcher"
      type="button"
      :aria-label="theme === 'day' ? '切换到夜景主题' : '切换到日景主题'"
      :aria-pressed="theme === 'night'"
      @click="$emit('toggle-theme')"
    >
      <svg v-if="theme === 'day'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="3.7" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </svg>
    </button>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['select', 'toggle-theme']);

const props = defineProps({
  menus: Array,
  activeId: Number,
  activeSubMenuId: Number,
  theme: { type: String, default: 'day' }
});

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

function handleFocusOut(menuId, event) {
  if (event.currentTarget.contains(event.relatedTarget)) return;
  hideSubMenu(menuId);
}

function handleMenuClick(menu) {
  emit('select', menu);
  if (!menu.subMenus || menu.subMenus.length === 0) {
    hoveredMenuId.value = null;
    return;
  }

  if (window.matchMedia?.('(hover: none)')?.matches) {
    hoveredMenuId.value = hoveredMenuId.value === menu.id ? null : menu.id;
  } else {
    hoveredMenuId.value = menu.id;
  }
}

function selectSubMenu(subMenu, parentMenu) {
  emit('select', subMenu, parentMenu);
  hoveredMenuId.value = null;
}

function closeSubMenu() {
  hoveredMenuId.value = null;
}
</script>

<style scoped>
.menu-bar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 0.5rem;
  position: relative;
  gap: 3px;
}

.menu-item {
  position: relative;
}

.menu-bar button {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  color: rgba(245,245,247,0.50);
  font-size: 14px;
  font-weight: 500;
  padding: 0.5rem 1.4rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 10px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.menu-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,0.10);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dot-active {
  background: #5B8DEF;
  box-shadow: 0 0 6px rgba(91,141,239,0.40);
}

.menu-bar button:hover {
  color: rgba(245,245,247,0.80);
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.08);
  transform: translateY(-1px);
}

.menu-bar button.active {
  color: #F5F5F7;
  background: rgba(91,141,239,0.10);
  border-color: rgba(91,141,239,0.15);
}

/* ========== 二级菜单 ========== */
.sub-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  background: rgba(22,22,26,0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  min-width: 120px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0,0,0,0.50);
  border: 1px solid rgba(255,255,255,0.06);
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
  background: rgba(91,141,239,0.10) !important;
  color: rgba(245,245,247,0.85) !important;
}

.sub-menu-item.active {
  background: rgba(91,141,239,0.15) !important;
  color: #F5F5F7 !important;
  font-weight: 500 !important;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .menu-bar {
    gap: 3px;
    padding: 0 0.3rem;
  }
  .menu-bar button {
    font-size: 12px;
    padding: 0.3rem 0.65rem;
    border-radius: 8px;
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
/* Theme-aware colors are inherited from the home page palette. */
.menu-bar {
  padding-right: 8.5rem;
}

.menu-bar button {
  background: var(--surface-soft, rgba(255,255,255,0.03));
  border-color: var(--border-subtle, rgba(255,255,255,0.04));
  color: var(--text-secondary, rgba(245,245,247,0.50));
}

.menu-dot {
  background: var(--border-strong, rgba(255,255,255,0.10));
}

.dot-active {
  background: var(--accent, #d85c8b);
  box-shadow: 0 0 6px var(--accent-glow, rgba(216,92,139,0.25));
}

.menu-bar button:hover {
  color: var(--text-primary, #F5F5F7);
  background: var(--surface-hover, rgba(255,255,255,0.06));
  border-color: var(--border-default, rgba(255,255,255,0.08));
}

.menu-bar button.active {
  color: var(--text-primary, #F5F5F7);
  background: var(--accent-soft, rgba(216,92,139,0.12));
  border-color: var(--accent-border, rgba(216,92,139,0.24));
}

.sub-menu {
  background: var(--bg-raised, rgba(22,22,26,0.92));
  box-shadow: var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.30));
  border-color: var(--border-default, rgba(255,255,255,0.06));
}

.sub-menu-item { color: var(--text-secondary, rgba(245,245,247,0.50)) !important; }
.sub-menu-item:hover {
  background: var(--accent-soft, rgba(216,92,139,0.12)) !important;
  color: var(--text-primary, #F5F5F7) !important;
}
.sub-menu-item.active {
  background: var(--accent-soft, rgba(216,92,139,0.16)) !important;
  color: var(--text-primary, #F5F5F7) !important;
}

.menu-bar .theme-switcher {
  position: absolute;
  top: 0;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 36px;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  color: var(--accent, #d85c8b);
  background: var(--surface-soft, rgba(255,255,255,0.03));
  border-color: var(--accent-border, rgba(216,92,139,0.24));
  box-shadow: var(--shadow-sm, 0 2px 12px rgba(0,0,0,0.12));
  font-size: 13px;
  line-height: 1;
  letter-spacing: 0.2px;
  white-space: nowrap;
  transform: none;
  z-index: 101;
}


.menu-bar .theme-switcher:hover {
  color: var(--accent, #d85c8b);
  background: var(--accent-soft, rgba(216,92,139,0.12));
  border-color: var(--accent, #d85c8b);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0,0,0,0.16));
  transform: translateY(-1px);
}

.menu-bar .theme-switcher svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: 0 0 auto;
}

.menu-bar button:focus-visible {
  outline: 3px solid var(--accent, #d85c8b);
  outline-offset: 3px;
  z-index: 2;
}

@media (max-width: 768px) {
  .menu-bar { padding: 0 3rem 0 0.3rem; }
  .menu-bar .theme-switcher { top: 0; right: 0.4rem; padding: 0.45rem 0.6rem; }
}

@media (max-width: 480px) {
  .menu-bar .theme-switcher { width: 36px; height: 36px; padding: 0; }
}
</style>
