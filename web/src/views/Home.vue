<template>
  <div class="home-container">
    <div class="home-inner">
      <div class="menu-bar-section">
        <MenuBar
          :menus="menus"
          :activeId="activeMenu?.id"
          :activeSubMenuId="activeSubMenu?.id"
          @select="selectMenu"
        />
      </div>

      <div class="search-section">
        <div class="search-box-wrapper">
          <div class="search-engine-select">
            <button v-for="engine in searchEngines" :key="engine.name"
              :class="['engine-btn', {active: selectedEngine.name === engine.name}]"
              @click="selectEngine(engine)"
            >
              {{ engine.label }}
            </button>
          </div>
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="selectedEngine.placeholder"
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch" aria-label="清空" title="clear">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
            <button @click="handleSearch" class="search-btn" title="search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="card-section">
        <CardGrid :cards="filteredCards"/>
      </div>
    </div>

    <footer class="footer">
      <p class="copyright">Copyright © 2025 Nav-Item | <a href="https://github.com/eooce/Nav-Item" target="_blank" class="footer-link">Powered by eooce</a></p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getMenus, getCards } from '../api';
import MenuBar from '../components/MenuBar.vue';
import CardGrid from '../components/CardGrid.vue';

const menus = ref([]);
const activeMenu = ref(null);
const activeSubMenu = ref(null);
const cards = ref([]);
const searchQuery = ref('');

const searchEngines = [
  {
    name: 'google',
    label: 'Google',
    placeholder: 'Google 搜索...',
    url: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`
  },
  {
    name: 'baidu',
    label: '百度',
    placeholder: '百度搜索...',
    url: q => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`
  },
  {
    name: 'bing',
    label: 'Bing',
    placeholder: 'Bing 搜索...',
    url: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}`
  },
  {
    name: 'github',
    label: 'github',
    placeholder: 'GitHub 搜索...',
    url: q => `https://github.com/search?q=${encodeURIComponent(q)}&type=repositories`
  },
  {
    name: 'site',
    label: '站内',
    placeholder: '站内搜索...',
    url: q => `/search?query=${encodeURIComponent(q)}`
  }
];
const selectedEngine = ref(searchEngines[0]);

function selectEngine(engine) {
  selectedEngine.value = engine;
}

function clearSearch() {
  searchQuery.value = '';
}

const filteredCards = computed(() => {
  if (!searchQuery.value) return cards.value;
  return cards.value.filter(card =>
    card.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    card.url.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  const res = await getMenus();
  menus.value = res.data;
  if (menus.value.length) {
    activeMenu.value = menus.value[0];
    loadCards();
  }
});

async function selectMenu(menu, parentMenu = null) {
  if (parentMenu) {
    activeMenu.value = parentMenu;
    activeSubMenu.value = menu;
  } else {
    activeMenu.value = menu;
    activeSubMenu.value = null;
  }
  loadCards();
}

async function loadCards() {
  if (!activeMenu.value) return;
  const res = await getCards(activeMenu.value.id, activeSubMenu.value?.id);
  cards.value = res.data;
}

async function handleSearch() {
  if (!searchQuery.value.trim()) return;
  if (selectedEngine.value.name === 'site') {
    let found = false;
    for (const menu of menus.value) {
      const res = await getCards(menu.id);
      const match = res.data.find(card =>
        card.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        card.url.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
      if (match) {
        activeMenu.value = menu;
        cards.value = res.data;
        setTimeout(() => {
          const el = document.querySelector(`[data-card-id='${match.id}']`);
          if (el) el.scrollIntoView({behavior: 'smooth', block: 'center'});
        }, 100);
        found = true;
        break;
      }
    }
    if (!found) {
      alert('未找到相关内容');
    }
  } else {
    const url = selectedEngine.value.url(searchQuery.value);
    window.open(url, '_blank');
  }
}
</script>

<style scoped>
/* ========== 首页容器 ========== */
.home-container {
  height: 100vh;
  background-color: #121212;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.home-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 0.8rem 0;
}

/* ========== 导航菜单 ========== */
.menu-bar-section {
  flex-shrink: 0;
  margin-bottom: 0.2rem;
  position: relative;
  z-index: 2;
}

/* ========== 搜索引擎切换 ========== */
.search-engine-select {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 0.4rem;
  gap: 4px;
  z-index: 2;
}
.engine-btn {
  border: 1px solid transparent;
  background: rgba(255,255,255,0.04);
  color: rgba(240,240,242,0.45);
  font-size: 0.78rem;
  padding: 5px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  letter-spacing: 0.3px;
  font-weight: 500;
  position: relative;
}
.engine-btn.active {
  color: #fff;
  background: rgba(91,141,239,0.12);
  border-color: rgba(91,141,239,0.25);
  box-shadow: 0 0 12px rgba(91,141,239,0.10);
}
.engine-btn:hover:not(.active) {
  color: rgba(240,240,242,0.75);
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.06);
}

/* ========== 搜索框 ========== */
.search-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}
.search-box-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 520px;
}
.search-container {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 0.2rem 0.2rem 0.2rem 1.2rem;
  box-shadow: 0 2px 20px rgba(0,0,0,0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06);
  max-width: 480px;
  width: 92%;
  position: relative;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.search-container:focus-within {
  background: rgba(255,255,255,0.07);
  border-color: rgba(91,141,239,0.20);
  box-shadow: 0 2px 24px rgba(0,0,0,0.40), 0 0 0 1px rgba(91,141,239,0.12);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem 0.5rem;
  font-size: 1.1rem;
  color: #F5F5F7;
  outline: none;
}
.search-input::placeholder {
  color: rgba(245,245,247,0.28);
}

.clear-btn {
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  margin-right: 0.1rem;
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 50%;
  color: rgba(245,245,247,0.28);
  transition: all 0.2s;
}
.clear-btn:hover {
  background: rgba(255,255,255,0.08);
  color: rgba(245,245,247,0.70);
}

.search-btn {
  background: linear-gradient(135deg, rgba(91,141,239,0.70), rgba(91,141,239,0.50));
  color: #F5F5F7;
  border: none;
  border-radius: 12px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}
.search-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #5B8DEF, #7BA4F9);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 12px;
}
.search-btn:hover {
  transform: scale(1.06);
  box-shadow: 0 4px 16px rgba(91,141,239,0.30);
}
.search-btn:hover::before {
  opacity: 1;
}
.search-btn svg {
  position: relative;
  z-index: 1;
}

/* ========== 卡片区域（可内部滚动） ========== */
.card-section {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0.8rem 0 0.2rem;
  min-height: 0;
}

/* 自定义卡片区域滚动条 */
.card-section::-webkit-scrollbar {
  width: 4px;
}
.card-section::-webkit-scrollbar-track {
  background: transparent;
}
.card-section::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
}

/* ========== 底部 ========== */
.footer {
  flex-shrink: 0;
  text-align: center;
  padding: 0.6rem 0 1rem;
  position: relative;
  z-index: 2;
}

.copyright {
  color: rgba(245,245,247,0.35);
  font-size: 12px;
  margin: 0;
}
.footer-link {
  color: rgba(245,245,247,0.40);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover {
  color: rgba(245,245,247,0.70);
}

/* ========== deep 穿透 ========== */
:deep(.card-grid) { position: relative; z-index: 2; }

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .home-inner { padding: 0.5rem 0; }
  .menu-bar-section { margin-bottom: 0; }
  .search-section { padding: 0; }
  .search-container { width: 94%; padding: 0.15rem 0.15rem 0.15rem 0.8rem; }
  .search-input { font-size: 1rem; padding: 0.35rem 0.4rem; }
  .search-btn { width: 38px; height: 38px; border-radius: 10px; }
  .card-section { padding: 0.5rem 0 0.2rem; }
  .footer { padding: 0.4rem 0 0.8rem; }
  .copyright { font-size: 11px; }
}
</style>
