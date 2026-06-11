<template>
  <div class="card-manage">
    <div class="card-header">
      <div class="header-content">
        <h2 class="page-title">管理网站导航卡片，支持主菜单和子菜单分类</h2>
      </div>
      <div class="card-add">
        <select v-model="selectedMenuId" class="input narrow" @change="onMenuChange">
          <option v-for="menu in menus" :value="menu.id" :key="menu.id">{{ menu.name }}</option>
        </select>
        <select v-model="selectedSubMenuId" class="input narrow" @change="onSubMenuChange">
          <option value="">主菜单</option>
          <option v-for="subMenu in currentSubMenus" :value="subMenu.id" :key="subMenu.id">{{ subMenu.name }}</option>
        </select>
        <input v-model="newCardTitle" placeholder="卡片标题" class="input narrow" />
        <input v-model="newCardUrl" placeholder="卡片链接" class="input wide" @blur="autoFetchIcon" />
        <div class="logo-input-wrapper">
          <input v-model="newCardLogo" placeholder="logo链接(可选)" class="input wide" />
          <div v-if="fetchingIcon" class="fetching-loader"></div>
        </div>
        <button class="btn" @click="addCard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          添加卡片
        </button>
      </div>
    </div>
    <div class="card-card">
      <table class="card-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>网址</th>
            <th>Logo链接</th>
            <th>描述</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="card in cards" :key="card.id">
            <td><input v-model="card.title" @blur="updateCard(card)" class="table-input" /></td>
            <td><input v-model="card.url" @blur="updateCard(card)" class="table-input" /></td>
            <td><input v-model="card.logo_url" @blur="updateCard(card)" class="table-input" placeholder="logo链接(可选)" /></td>
            <td><input v-model="card.desc" @blur="updateCard(card)" class="table-input" placeholder="描述（可选）" /></td>
            <td><input v-model.number="card.order" type="number" @blur="updateCard(card)" class="table-input order-input" /></td>
            <td>
              <button class="btn btn-danger btn-icon" @click="deleteCard(card.id)" title="删除">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { 
  getMenus, 
  getCards, 
  addCard as apiAddCard, 
  updateCard as apiUpdateCard, 
  deleteCard as apiDeleteCard,
  fetchIcon
} from '../../api';

const menus = ref([]);
const cards = ref([]);
const selectedMenuId = ref();
const selectedSubMenuId = ref('');
const newCardTitle = ref('');
const newCardUrl = ref('');
const newCardLogo = ref('');
const fetchingIcon = ref(false);

const currentSubMenus = computed(() => {
  if (!selectedMenuId.value) return [];
  const menu = menus.value.find(m => m.id === selectedMenuId.value);
  return menu?.subMenus || [];
});

onMounted(async () => {
  const res = await getMenus();
  menus.value = res.data;
  if (menus.value.length) {
    selectedMenuId.value = menus.value[0].id;
    selectedSubMenuId.value = '';
  }
});

watch(selectedMenuId, () => {
  selectedSubMenuId.value = '';
  loadCards();
});

watch(selectedSubMenuId, loadCards);

function onMenuChange() {
  selectedSubMenuId.value = '';
}

function onSubMenuChange() {
  loadCards();
}

async function loadCards() {
  if (!selectedMenuId.value) return;
  const res = await getCards(selectedMenuId.value, selectedSubMenuId.value || null);
  cards.value = res.data;
}

async function autoFetchIcon() {
  if (!newCardUrl.value || newCardLogo.value) return;
  fetchingIcon.value = true;
  try {
    const res = await fetchIcon(newCardUrl.value);
    if (res.data.iconUrl) {
      newCardLogo.value = res.data.iconUrl;
    }
  } catch (e) {
    console.error('自动获取图标失败:', e);
  } finally {
    fetchingIcon.value = false;
  }
}

async function addCard() {
  if (!newCardTitle.value || !newCardUrl.value) {
    alert('请填写标题和网址');
    return;
  }
  try {
    await apiAddCard({ 
      menu_id: Number(selectedMenuId.value), 
      sub_menu_id: selectedSubMenuId.value ? Number(selectedSubMenuId.value) : null,
      title: newCardTitle.value, 
      url: newCardUrl.value, 
      logo_url: newCardLogo.value || '',
      desc: '',
      order: 0
    });
    newCardTitle.value = '';
    newCardUrl.value = '';
    newCardLogo.value = '';
    await loadCards();
  } catch (error) {
    console.error('添加卡片失败:', error);
    alert('添加失败: ' + (error.response?.data?.message || error.message));
  }
}

async function updateCard(card) {
  await apiUpdateCard(card.id, {
    menu_id: selectedMenuId.value,
    sub_menu_id: selectedSubMenuId.value || null,
    title: card.title,
    url: card.url,
    logo_url: card.logo_url,
    desc: card.desc,
    order: card.order
  });
  loadCards();
}

async function deleteCard(id) {
  await apiDeleteCard(id);
  loadCards();
}
</script>

<style scoped>
.card-manage {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 20px 28px;
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
  letter-spacing: -0.3px;
  opacity: 0.9;
}

.card-add {
  margin: 0 auto;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.card-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
  width: 100%;
}

.card-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.card-table th,
.card-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}

.card-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.card-table th:nth-child(1),
.card-table td:nth-child(1) { width: 12%; }
.card-table th:nth-child(2),
.card-table td:nth-child(2) { width: 25%; }
.card-table th:nth-child(3),
.card-table td:nth-child(3) { width: 22%; }
.card-table th:nth-child(4),
.card-table td:nth-child(4) { width: 14%; }
.card-table th:nth-child(5),
.card-table td:nth-child(5) { width: 8%; }
.card-table th:nth-child(6),
.card-table td:nth-child(6) { width: 10%; text-align: center; }

.card-table tr:last-child td {
  border-bottom: none;
}

.card-table tr:hover td {
  background: #f8fafc;
}

/* ========== 输入框 ========== */
.input {
  padding: 9px 12px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #1e293b;
  font-size: 0.88rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  height: 38px;
}
.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}
.input.narrow {
  width: 130px;
}
.input.medium {
  width: 150px;
}
.input.wide {
  width: 200px;
}

.logo-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.fetching-loader {
  position: absolute;
  right: 10px;
  width: 14px;
  height: 14px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 表格内输入框 */
.table-input {
  width: 100%;
  min-width: 40px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1.5px solid transparent;
  background: transparent;
  color: #1e293b;
  font-size: 13px;
  transition: all 0.2s ease;
}
.table-input:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.table-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.06);
}

.order-input {
  width: 60px;
  text-align: center;
}

/* ========== 按钮 ========== */
.btn {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.88rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  height: 38px;
}
.btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-icon {
  width: 34px;
  height: 34px;
  padding: 0;
  justify-content: center;
  border-radius: 8px;
}

.btn-danger {
  background: #fee2e2;
  color: #ef4444;
}
.btn-danger:hover {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

@media (max-width: 768px) {
  .card-manage {
    width: 100%;
  }
  .card-header {
    padding: 16px;
    border-radius: 12px;
  }
  .page-title {
    font-size: 1rem;
  }
  .card-add {
    flex-direction: column;
    gap: 8px;
  }
  .input.narrow,
  .input.medium,
  .input.wide {
    width: 100%;
  }
  .card-table th,
  .card-table td {
    padding: 8px 10px;
    font-size: 12px;
  }
  .order-input {
    width: 50px;
  }
}
</style> 