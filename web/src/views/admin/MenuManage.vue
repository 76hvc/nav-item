<template>
  <div class="menu-manage">
    <div class="menu-header">
      <div class="header-content">
        <h2 class="page-title">管理主菜单和子菜单</h2>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                  <path d="m6 9 6 6 6-6"/>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11H1l8-8 8 8h-8v8z"/>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
              <!-- <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M9 11H1l8-8 8 8h-8v8z"/>
              </svg> -->
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
    showSubMenu: false // 添加展开状态
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
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.header-content {
  margin-bottom: 14px;
  text-align: center;
}

.page-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  opacity: 0.9;
}

.menu-add {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.menu-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  width: 100%;
}

.menu-list {
  padding: 0;
}

.menu-item {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-item:hover {
  background: #fafbfc;
}

/* ========== 主菜单行 ========== */
.main-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  background: white;
}

.menu-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.menu-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 16px;
}

.menu-name-input {
  font-size: 1rem;
  font-weight: 600;
  border: 1.5px solid transparent;
  background: transparent;
  padding: 6px 10px;
  border-radius: 6px;
  color: #1e293b;
  min-width: 160px;
  transition: all 0.2s ease;
}
.menu-name-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #f8fafc;
}

.menu-order {
  display: flex;
  align-items: center;
  gap: 6px;
}
.order-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.menu-actions {
  display: flex;
  gap: 6px;
}

/* ========== 子菜单区域 ========== */
.sub-menu-section {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease;
}
.sub-menu-section.expanded {
  max-height: 1000px;
}

.sub-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 28px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.sub-menu-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
}

.sub-menu-list {
  padding: 12px 28px 12px 44px;
  position: relative;
}
.sub-menu-list::before {
  content: '';
  position: absolute;
  left: 28px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.sub-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: white;
  border-radius: 10px;
  margin-bottom: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  position: relative;
}
.sub-menu-item::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  width: 12px;
  height: 2px;
  background: #cbd5e1;
  transform: translateY(-50%);
}
.sub-menu-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border-color: #cbd5e1;
}
.sub-menu-item:last-child {
  margin-bottom: 0;
}

.sub-menu-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.sub-menu-icon {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 14px;
}

.sub-menu-name-input {
  font-size: 14px;
  border: 1.5px solid transparent;
  background: transparent;
  padding: 5px 8px;
  border-radius: 6px;
  color: #374151;
  min-width: 130px;
  transition: all 0.2s ease;
}
.sub-menu-name-input:focus {
  outline: none;
  border-color: #10b981;
  background: #f0fdf4;
}

.sub-menu-actions {
  display: flex;
  gap: 4px;
}

.empty-sub-menu {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
}
.empty-sub-menu p {
  color: #10b981;
  margin: 0 0 12px;
  font-size: 14px;
}

/* ========== 通用按钮 ========== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}
.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-outline {
  background: transparent;
  color: #3b82f6;
  border: 1.5px solid #3b82f6;
}
.btn-outline:hover {
  background: #3b82f6;
  color: white;
}

.btn-danger {
  background: #fee2e2;
  color: #ef4444;
}
.btn-danger:hover {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.btn-icon {
  width: 34px;
  height: 34px;
  padding: 0;
  justify-content: center;
  border-radius: 8px;
}

.btn-icon.expand-btn {
  width: 34px;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}
.btn-icon.btn-sm {
  width: 30px;
  height: 28px;
}

/* ========== 输入框 ========== */
.input {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  color: #1e293b;
  transition: all 0.2s ease;
  min-width: 200px;
  height: 38px;
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}
.input::placeholder {
  color: #94a3b8;
}

.order-input {
  width: 52px;
  padding: 5px 6px;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  height: 32px;
  box-sizing: border-box;
}
.order-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.08);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .menu-manage {
    width: 100%;
  }
  .menu-header {
    padding: 18px 16px;
    border-radius: 12px;
  }
  .page-title {
    font-size: 1rem;
  }
  .menu-add {
    flex-direction: column;
    gap: 8px;
  }
  .input {
    min-width: 0;
    width: 100%;
  }
  .main-menu {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .menu-info {
    flex-wrap: wrap;
    gap: 10px;
  }
  .menu-name-input {
    min-width: 0;
  }
  .menu-actions {
    justify-content: flex-start;
  }
  .sub-menu-header {
    padding: 10px 16px;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  .sub-menu-list {
    padding: 10px 16px 10px 28px;
  }
  .sub-menu-list::before {
    left: 16px;
  }
  .sub-menu-item::before {
    left: -12px;
    width: 8px;
  }
  .sub-menu-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .sub-menu-info {
    flex-wrap: wrap;
  }
  .sub-menu-name-input {
    min-width: 0;
  }
}
</style> 