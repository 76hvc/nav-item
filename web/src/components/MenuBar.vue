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
        @click="$emit('select', menu)"
        :class="{active: menu.id === activeId}"
      >
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
          @click="$emit('select', subMenu, menu)"
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

const props = defineProps({ 
  menus: Array, 
  activeId: Number,
  activeSubMenuId: Number 
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
  }, 100);
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
  color: rgba(245,245,247,0.55);
  font-size: 14px;
  font-weight: 500;
  padding: 0.5rem 1.4rem;
  cursor: pointer;
  transition: all 0.25s ease;
  border-radius: 10px;
  letter-spacing: 0.5px;
}

.menu-bar button:hover {
  color: rgba(245,245,247,0.80);
  background: rgba(255,255,255,0.05);
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
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  background: rgba(25,25,30,0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 12px;
  min-width: 120px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 5px;
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
  color: rgba(245,245,247,0.55) !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  border-radius: 8px !important;
  text-shadow: none !important;
  line-height: 1.5 !important;
  letter-spacing: 0.3px !important;
}

.sub-menu-item:hover {
  background: rgba(91,141,239,0.10) !important;
  color: rgba(245,245,247,0.85) !important;
  transform: none !important;
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
</style> 