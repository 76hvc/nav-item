<template>
  <div class="menu-manage">
    <div class="menu-header">
      <div class="header-content">
        <h2 class="page-title">栏目管理 · 管理主菜单和子菜单</h2>
      </div>
      <div class="menu-add">
        <input v-model="newMenuName" placeholder="请输入主菜单名称" class="input" />
        <button class="btn btn-primary" @click="addMenu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          添加主菜单
        </button>
      </div>
    </div>

    <div class="menu-content">
      <div class="menu-list">
        <div v-for="menu in menus" :key="menu.id" class="menu-item">
          <!-- 主菜单 -->
          <div class="main-menu">
            <div class="menu-info">
              <div class="menu-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                </svg>
              </div>
              <input v-model="menu.name" @blur="updateMenu(menu)" class="menu-name-input" />
              <div class="menu-order">
                <span class="order-label">排序</span>
                <input v-model.number="menu.order" type="number" @blur="updateMenu(menu)" class="order-input" />
              </div>
            </div>
            <div class="menu-actions">
              <button class="btn btn-icon expand-btn" @click="toggleSubMenu(menu.id)" :title="menu.showSubMenu ? '收起子菜单' : '展开子菜单'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
              <button class="btn btn-danger btn-icon" @click="deleteMenu(menu.id)" title="删除主菜单">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 子菜单区域 -->
          <div class="sub-menu-section" :class="{ 'expanded': menu.showSubMenu }">
            <div class="sub-menu-header">
              <div class="sub-menu-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                子菜单 ({{ menu.subMenus?.length || 0 }})
              </div>
              <button class="btn btn-sm btn-outline" @click="addSubMenu(menu.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                添加子菜单
              </button>
            </div>

            <div class="sub-menu-list" v-if="menu.subMenus && menu.subMenus.length > 0">
              <div v-for="subMenu in menu.subMenus" :key="subMenu.id" class="sub-menu-item">
                <div class="sub-menu-info">
                  <div class="sub-menu-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                  </div>
                  <input v-model="subMenu.name" @blur="updateSubMenu(subMenu)" class="sub-menu-name-input" />
                  <div class="sub-menu-order">
                    <input v-model.number="subMenu.order" type="number" @blur="updateSubMenu(subMenu)" class="order-input" />
                  </div>
                </div>
                <div class="sub-menu-actions">
                  <button class="btn btn-danger btn-icon btn-sm" @click="deleteSubMenu(subMenu.id)" title="删除子菜单">
                    <svg width="14" height="14" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-sub-menu">
              <p>暂无子菜单</p>
              <button class="btn btn-sm btn-outline" @click="addSubMenu(menu.id)">添加第一个子菜单</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  getMenus,
  addMenu as apiAddMenu,
  updateMenu as apiUpdateMenu,
  deleteMenu as apiDeleteMenu,
  addSubMenu as apiAddSubMenu,
  updateSubMenu as apiUpdateSubMenu,
  deleteSubMenu as apiDeleteSubMenu
} from '../../api';

const menus = ref([]);
const newMenuName = ref('');

onMounted(loadMenus);

async function loadMenus() {
  const res = await getMenus();
  menus.value = res.data.map(menu => ({
    ...menu,
    showSubMenu: false
  }));
}

async function addMenu() {
  if (!newMenuName.value.trim()) return;
  const maxOrder = menus.value.length
    ? Math.max(...menus.value.map(m => m.order || 0))
    : 0;
  await apiAddMenu({ name: newMenuName.value.trim(), order: maxOrder + 1 });
  newMenuName.value = '';
  loadMenus();
}

async function updateMenu(menu) {
  await apiUpdateMenu(menu.id, { name: menu.name, order: menu.order });
  loadMenus();
}

async function deleteMenu(id) {
  if (!confirm('确定要删除这个主菜单吗？删除后将同时删除其下的所有子菜单和卡片。')) return;
  await apiDeleteMenu(id);
  loadMenus();
}

async function addSubMenu(menuId) {
  const menu = menus.value.find(m => m.id === menuId);
  const subMenuName = prompt('请输入子菜单名称：');
  if (!subMenuName?.trim()) return;

  const maxOrder = menu.subMenus?.length
    ? Math.max(...menu.subMenus.map(sm => sm.order || 0))
    : 0;

  await apiAddSubMenu(menuId, { name: subMenuName.trim(), order: maxOrder + 1 });
  loadMenus();
}

async function updateSubMenu(subMenu) {
  await apiUpdateSubMenu(subMenu.id, { name: subMenu.name, order: subMenu.order });
  loadMenus();
}

async function deleteSubMenu(id) {
  if (!confirm('确定要删除这个子菜单吗？删除后将同时删除其下的所有卡片。')) return;
  await apiDeleteSubMenu(id);
  loadMenus();
}

function toggleSubMenu(menuId) {
  const menu = menus.value.find(m => m.id === menuId);
  if (menu) {
    menu.showSubMenu = !menu.showSubMenu;
  }
}
</script>

<style scoped>
.menu-manage {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-header {
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 16px;
  padding: 18px 24px;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}

.header-content {
  margin-bottom: 14px;
  text-align: center;
}

.page-title {
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  color: rgba(245,245,247,0.45);
}

.menu-add {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.menu-content {
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
}

.menu-list { padding: 0; }

.menu-item {
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: all 0.2s ease;
}
.menu-item:last-child { border-bottom: none; }
.menu-item:hover { background: rgba(255,255,255,0.01); }

.main-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.menu-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.menu-icon {
  width: 34px;
  height: 34px;
  background: rgba(91,141,239,0.10);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5B8DEF;
  flex-shrink: 0;
}

.menu-name-input {
  font-size: 0.95rem;
  font-weight: 500;
  border: 1.5px solid transparent;
  background: transparent;
  padding: 5px 8px;
  border-radius: 6px;
  color: rgba(245,245,247,0.82);
  min-width: 140px;
  transition: all 0.2s ease;
}
.menu-name-input:focus {
  outline: none;
  border-color: rgba(91,141,239,0.20);
  background: rgba(255,255,255,0.03);
}

.menu-order {
  display: flex;
  align-items: center;
  gap: 4px;
}
.order-label {
  font-size: 11px;
  color: rgba(245,245,247,0.28);
  font-weight: 500;
}

.menu-actions {
  display: flex;
  gap: 4px;
}

/* ========== 子菜单区域 ========== */
.sub-menu-section {
  background: rgba(255,255,255,0.02);
  border-top: 1px solid rgba(255,255,255,0.03);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}
.sub-menu-section.expanded { max-height: 1000px; }

.sub-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.sub-menu-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: rgba(245,245,247,0.38);
  font-size: 12px;
}

.sub-menu-list {
  padding: 10px 24px 10px 40px;
  position: relative;
}
.sub-menu-list::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 0;
  bottom: 0;
  width: 1.5px;
  background: rgba(255,255,255,0.06);
}

.sub-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 14px;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  margin-bottom: 3px;
  border: 1px solid rgba(255,255,255,0.04);
  transition: all 0.2s ease;
  position: relative;
}
.sub-menu-item::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  width: 10px;
  height: 1.5px;
  background: rgba(255,255,255,0.08);
  transform: translateY(-50%);
}
.sub-menu-item:hover {
  border-color: rgba(91,141,239,0.10);
  background: rgba(255,255,255,0.03);
}
.sub-menu-item:last-child { margin-bottom: 0; }

.sub-menu-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.sub-menu-icon {
  width: 26px;
  height: 26px;
  background: rgba(91,141,239,0.08);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(91,141,239,0.50);
  flex-shrink: 0;
}

.sub-menu-name-input {
  font-size: 13px;
  border: 1.5px solid transparent;
  background: transparent;
  padding: 4px 6px;
  border-radius: 6px;
  color: rgba(245,245,247,0.68);
  min-width: 110px;
  transition: all 0.2s ease;
}
.sub-menu-name-input:focus {
  outline: none;
  border-color: rgba(91,141,239,0.18);
  background: rgba(255,255,255,0.03);
}

.sub-menu-actions {
  display: flex;
  gap: 4px;
}

.empty-sub-menu {
  padding: 20px;
  text-align: center;
  color: rgba(245,245,247,0.25);
}
.empty-sub-menu p {
  color: rgba(245,245,247,0.35);
  margin: 0 0 10px;
  font-size: 13px;
}

/* ========== 通用按钮 ========== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  border-radius: 8px;
  font-size: 0.83rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background: rgba(91,141,239,0.50);
  color: #F5F5F7;
}
.btn-primary:hover {
  background: #5B8DEF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91,141,239,0.20);
}

.btn-outline {
  background: transparent;
  color: rgba(91,141,239,0.50);
  border: 1.5px solid rgba(91,141,239,0.20);
}
.btn-outline:hover {
  background: rgba(91,141,239,0.10);
  color: #5B8DEF;
  border-color: rgba(91,141,239,0.30);
}

.btn-danger {
  background: rgba(239,68,68,0.07);
  color: rgba(239,68,68,0.60);
}
.btn-danger:hover {
  background: rgba(239,68,68,0.12);
  color: #ef4444;
}

.btn-icon {
  width: 30px;
  height: 30px;
  padding: 0;
  justify-content: center;
  border-radius: 6px;
}
.btn-icon.expand-btn { width: 30px; }

.btn-sm {
  padding: 4px 10px;
  font-size: 0.78rem;
}
.btn-icon.btn-sm { width: 28px; height: 26px; }

/* ========== 输入框 ========== */
.input {
  padding: 9px 12px;
  border: 1.5px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  font-size: 0.9rem;
  background: rgba(255,255,255,0.03);
  color: #F5F5F7;
  transition: all 0.2s ease;
  min-width: 180px;
  height: 36px;
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: rgba(91,141,239,0.25);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 0 2px rgba(91,141,239,0.06);
}
.input::placeholder { color: rgba(245,245,247,0.20); }

.order-input {
  width: 48px;
  padding: 4px;
  border: 1.5px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  text-align: center;
  font-size: 13px;
  height: 30px;
  box-sizing: border-box;
  background: rgba(255,255,255,0.02);
  color: rgba(245,245,247,0.58);
}
.order-input:focus {
  outline: none;
  border-color: rgba(91,141,239,0.20);
  box-shadow: 0 0 0 2px rgba(91,141,239,0.04);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .menu-manage { width: 100%; }
  .menu-header { padding: 16px; border-radius: 12px; }
  .page-title { font-size: 0.85rem; }
  .menu-add { flex-direction: column; gap: 8px; }
  .input { min-width: 0; width: 100%; }
  .main-menu {
    padding: 14px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .menu-info { flex-wrap: wrap; gap: 8px; }
  .menu-name-input { min-width: 0; }
  .menu-actions { justify-content: flex-start; }
  .sub-menu-header {
    padding: 8px 14px;
    flex-direction: column;
    gap: 6px;
    align-items: stretch;
  }
  .sub-menu-list { padding: 8px 14px 8px 28px; }
  .sub-menu-list::before { left: 14px; }
  .sub-menu-item::before { left: -14px; width: 8px; }
  .sub-menu-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .sub-menu-info { flex-wrap: wrap; }
  .sub-menu-name-input { min-width: 0; }
}
</style>
