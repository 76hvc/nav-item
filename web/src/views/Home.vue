<template>
  <div class="home-container" :data-theme="theme">
    <div class="menu-bar-fixed">
      <MenuBar
        :menus="menus"
        :theme="theme"
        @toggle-theme="toggleTheme"
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

    <!-- 左侧广告条 -->
    <div v-if="leftAds.length" class="ad-space-fixed left-ad-fixed">
      <a v-for="ad in leftAds" :key="ad.id" :href="ad.url" target="_blank">
        <img :src="ad.img" alt="广告" />
      </a>
    </div>
    <!-- 右侧广告条 -->
    <div v-if="rightAds.length" class="ad-space-fixed right-ad-fixed">
      <a v-for="ad in rightAds" :key="ad.id" :href="ad.url" target="_blank">
        <img :src="ad.img" alt="广告" />
      </a>
    </div>

    <CardGrid :cards="filteredCards"/>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { mountSakura } from '../utils/sakura.js';
import { getMenus, getCards, getAds } from '../api';
import MenuBar from '../components/MenuBar.vue';
import CardGrid from '../components/CardGrid.vue';

const menus = ref([]);
const THEME_STORAGE_KEY = 'nav-item-theme';

function readSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'night' ? 'night' : 'day';
  } catch {
    return 'day';
  }
}

const theme = ref(readSavedTheme());
let stopSakura = null;

function toggleTheme() {
  theme.value = theme.value === 'day' ? 'night' : 'day';
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme.value);
  } catch {
    // Theme switching still works for this page when storage is unavailable.
  }
}


const activeMenu = ref(null);
const activeSubMenu = ref(null);
const cards = ref([]);
const searchQuery = ref('');
const leftAds = ref([]);
const rightAds = ref([]);

// 聚合搜索配置
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
  stopSakura = mountSakura();
  const res = await getMenus();
  menus.value = res.data;
  if (menus.value.length) {
    activeMenu.value = menus.value[0];
    loadCards();
  }
  // 加载广告
  const adRes = await getAds();
  leftAds.value = adRes.data.filter(ad => ad.position === 'left');
  rightAds.value = adRes.data.filter(ad => ad.position === 'right');

});

onUnmounted(() => {
  if (stopSakura) stopSakura();
});

async function selectMenu(menu, parentMenu = null) {
  if (parentMenu) {
    // 选择的是子菜单
    activeMenu.value = parentMenu;
    activeSubMenu.value = menu;
  } else {
    // 选择的是主菜单
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
    // 站内搜索：遍历所有菜单，查找所有卡片
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
/* ========== 配色常量 ========== */
/*
  暗色低调极简风格配色：
  --bg-base: #121212    页面底色
  --bg-raised: #1E1E1E  卡片、弹窗
  --bg-overlay: #252525  输入框、按钮hover
  --text-primary: #F5F5F7
  --text-secondary: rgba(245,245,247,0.60)
  --text-tertiary: rgba(245,245,247,0.30)
  --border-subtle: rgba(255,255,255,0.06)
  --border-default: rgba(255,255,255,0.10)
  --accent: #5B8DEF
  --accent-hover: #7BA4F9
*/

.menu-bar-fixed {
  position: fixed;
  top: 0.6rem;
  left: 0;
  width: 100vw;
  z-index: 100;
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

/* ========== 首页容器 ========== */
.home-container {
  min-height: 100vh;
  background-color: #121212;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 55px;
}

/* 可选背景图：如果用户设置，覆盖纯色背景 */
.home-container.has-bg {
  background-image: url('https://main.ssss.nyc.mn/background.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* 搜索区布局 */
.search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 0 1.5rem;
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

/* ========== 广告位（固定侧边） ========== */
.ad-space-fixed {
  position: fixed;
  top: 12rem;
  z-index: 10;
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
  background: transparent;
  margin: 0;
}
.left-ad-fixed { left: 0; }
.right-ad-fixed { right: 0; }
.ad-space-fixed a {
  width: 100%;
  display: block;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ad-space-fixed a:hover {
  transform: scale(1.06) translateY(-2px);
}
.ad-space-fixed img {
  width: 100%;
  max-width: 80px;
  max-height: 150px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.30);
  background: #1E1E1E;
  object-fit: contain;
  margin: 0 auto;
  border: 1px solid rgba(255,255,255,0.04);
}

/* ========== deep 穿透 ========== */
:deep(.menu-bar) { position: relative; z-index: 2; }
:deep(.card-grid) { position: relative; z-index: 2; }

/* ========== 入场动画 ========== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* ========== 响应式 ========== */
@media (max-width: 1200px) {
  .ad-space-fixed { display: none; }
}

@media (max-width: 768px) {
  .home-container { padding-top: 60px; }
  .search-section { padding: 2rem 0 1rem; }
  .search-container { width: 94%; padding: 0.15rem 0.15rem 0.15rem 0.8rem; }
  .search-input { font-size: 1rem; padding: 0.35rem 0.4rem; }
  .search-btn { width: 38px; height: 38px; border-radius: 10px; }
}
/* Sakura day and night palettes */
.home-container {
  --bg-base: #fbf6f9;
  --bg-raised: rgba(255,255,255,0.86);
  --bg-overlay: #fffdfd;
  --surface-soft: rgba(255,255,255,0.72);
  --surface-hover: rgba(255,255,255,0.96);
  --text-primary: #382b38;
  --text-secondary: rgba(56,43,56,0.72);
  --text-tertiary: rgba(56,43,56,0.48);
  --border-subtle: rgba(112,73,94,0.09);
  --border-default: rgba(112,73,94,0.15);
  --border-strong: rgba(112,73,94,0.24);
  --accent: #d45284;
  --accent-light: #e978a1;
  --accent-soft: rgba(212,82,132,0.12);
  --accent-wash: rgba(212,82,132,0.055);
  --accent-border: rgba(212,82,132,0.28);
  --accent-glow: rgba(212,82,132,0.2);
  --overlay-backdrop: rgba(67,43,57,0.3);
  --shadow-sm: 0 2px 12px rgba(90,57,75,0.08);
  --shadow-md: 0 8px 24px rgba(90,57,75,0.1);
  --shadow-lg: 0 12px 32px rgba(90,57,75,0.13);
  --shadow-xl: 0 25px 80px rgba(52,33,46,0.24);
  --bg-wash-a: rgba(235,183,204,0.23);
  --bg-wash-b: rgba(217,207,235,0.2);
  --bg-end: #f8eff5;
  --petal-color: #da86a4;
  position: relative;
  isolation: isolate;
  color: var(--text-primary);
  color-scheme: light;
  background-color: var(--bg-base);
  background-image: url('/sakura-day.webp?v=soft-pink-20261016');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  overflow-x: hidden;
}

.home-container[data-theme="night"] {
  --bg-base: #0b0b0d;
  --bg-raised: rgba(25,25,29,0.94);
  --bg-overlay: #242428;
  --surface-soft: rgba(28,28,33,0.82);
  --surface-hover: rgba(45,45,51,0.92);
  --text-primary: #f3f3f5;
  --text-secondary: rgba(243,243,245,0.76);
  --text-tertiary: rgba(243,243,245,0.52);
  --border-subtle: rgba(255,255,255,0.08);
  --border-default: rgba(255,255,255,0.14);
  --border-strong: rgba(255,255,255,0.24);
  --accent: #d7d9df;
  --accent-light: #f0f2f7;
  --accent-soft: rgba(220,225,236,0.14);
  --accent-wash: rgba(220,225,236,0.07);
  --accent-border: rgba(220,225,236,0.3);
  --accent-glow: rgba(220,225,236,0.22);
  --overlay-backdrop: rgba(5,5,7,0.76);
  --shadow-sm: 0 2px 12px rgba(0,0,0,0.2);
  --shadow-md: 0 8px 24px rgba(0,0,0,0.25);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.34);
  --shadow-xl: 0 25px 80px rgba(0,0,0,0.55);
  --bg-wash-a: rgba(205,207,215,0.16);
  --bg-wash-b: rgba(133,135,144,0.12);
  --bg-end: #09090d;
  --petal-color: #e8eaf0;
  color-scheme: dark;
  background-color: #08080b;
  background-image:
    linear-gradient(180deg, rgba(7,7,10,0.1) 0%, rgba(7,7,10,0.24) 48%, rgba(7,7,10,0.78) 100%),
    linear-gradient(90deg, rgba(6,6,9,0.18), rgba(6,6,9,0.28)),
    url('/sakura-night.webp');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.home-container::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: none;
}

.home-container[data-theme="night"]::before {
  background:
    radial-gradient(circle at 29% 23%, rgba(226,232,245,0.12), transparent 17rem),
    linear-gradient(180deg, rgba(7,7,10,0.02), rgba(7,7,10,0.12));
  animation: moonlit-breath 9s ease-in-out infinite;
}

@keyframes moonlit-breath {
  0%, 100% { opacity: 0.62; }
  50% { opacity: 1; }
}

.home-container .menu-bar-fixed { z-index: 100; }
.home-container .search-section,
.home-container :deep(.card-grid) { position: relative; z-index: 2; }

.home-container .engine-btn {
  color: var(--text-secondary);
  background: var(--surface-soft);
  border-color: var(--border-subtle);
}
.home-container .engine-btn.active {
  color: var(--text-primary);
  background: var(--accent-soft);
  border-color: var(--accent-border);
  box-shadow: 0 0 12px var(--accent-glow);
}
.home-container .engine-btn:hover:not(.active) {
  color: var(--text-primary);
  background: var(--surface-hover);
  border-color: var(--border-default);
}
.home-container .search-container {
  background: var(--surface-soft);
  border-color: var(--border-default);
  box-shadow: var(--shadow-md);
}
.home-container .search-container:focus-within {
  background: var(--surface-hover);
  border-color: var(--accent-border);
  box-shadow: var(--shadow-md), 0 0 0 1px var(--accent-soft);
}
.home-container .search-input { color: var(--text-primary); }
.home-container .search-input::placeholder { color: var(--text-tertiary); }
.home-container .clear-btn { color: var(--text-tertiary); }
.home-container .clear-btn:hover { color: var(--text-primary); background: var(--surface-hover); }
.home-container .search-btn {
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
}
.home-container .search-btn::before { background: linear-gradient(135deg, var(--accent), var(--accent-light)); }
.home-container .search-btn:hover { box-shadow: 0 4px 16px var(--accent-glow); }

.home-container .ad-space-fixed img {
  background: var(--bg-raised);
  border-color: var(--border-subtle);
  box-shadow: var(--shadow-md);
}
.home-container :deep(.menu-bar button:focus-visible),
.home-container .search-input:focus-visible,
.home-container button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

@media (max-width: 768px) {
  .home-container { background-attachment: scroll; }
  .home-container .search-container { backdrop-filter: none; -webkit-backdrop-filter: none; }
}

@media (max-width: 520px) {
  .home-container .search-section { padding-top: 2rem; }
}

@media (max-width: 768px) and (orientation: portrait) {
  .home-container:not([data-theme="night"])::before {
    background-image: url('/sakura-day-mobile.webp?v=mobile-pink-20261016');
    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .home-container[data-theme="night"]::before {
    background-image:
      radial-gradient(circle at 29% 23%, rgba(226,232,245,0.12), transparent 17rem),
      linear-gradient(180deg, rgba(7,7,10,0.02), rgba(7,7,10,0.16)),
      url('/sakura-night-mobile.webp?v=mobile-night-20261016');
    background-position: center center;
    background-size: auto, auto, cover;
    background-repeat: no-repeat;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-container *,
  .home-container *::before,
  .home-container *::after { scroll-behavior: auto !important; }
}
</style>
