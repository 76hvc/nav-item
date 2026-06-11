<template>
  <div class="home-container">
    <div class="menu-bar-fixed">
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

    <footer class="footer">
      <div class="footer-content">
        <button @click="showFriendLinks = true" class="friend-link-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          友情链接
        </button>
        <p class="copyright">Copyright © 2025 Nav-Item | <a href="https://github.com/eooce/Nav-Item" target="_blank" class="footer-link">Powered by eooce</a></p>
      </div>
    </footer>

    <!-- 友情链接弹窗 -->
    <div v-if="showFriendLinks" class="modal-overlay" @click="showFriendLinks = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>友情链接</h3>
          <button @click="showFriendLinks = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="friend-links-grid">
            <a
              v-for="friend in friendLinks"
              :key="friend.id"
              :href="friend.url"
              target="_blank"
              class="friend-link-card"
            >
              <div class="friend-link-logo">
                <img
                  v-if="friend.logo"
                  :src="friend.logo"
                  :alt="friend.title"
                  @error="handleLogoError"
                />
                <div v-else class="friend-link-placeholder">
                  {{ friend.title.charAt(0) }}
                </div>
              </div>
              <div class="friend-link-info">
                <h4>{{ friend.title }}</h4>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getMenus, getCards, getAds, getFriends } from '../api';
import MenuBar from '../components/MenuBar.vue';
import CardGrid from '../components/CardGrid.vue';

const menus = ref([]);
const activeMenu = ref(null);
const activeSubMenu = ref(null);
const cards = ref([]);
const searchQuery = ref('');
const leftAds = ref([]);
const rightAds = ref([]);
const showFriendLinks = ref(false);
const friendLinks = ref([]);

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

  const friendRes = await getFriends();
  friendLinks.value = friendRes.data;
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

function handleLogoError(event) {
  event.target.style.display = 'none';
  event.target.nextElementSibling.style.display = 'flex';
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

/* ========== 底部 ========== */
.footer {
  margin-top: auto;
  text-align: center;
  padding: 2rem 0 2.5rem;
  position: relative;
  z-index: 2;
}
.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.friend-link-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(245,245,247,0.50);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 13px;
  padding: 7px 18px;
  border-radius: 20px;
  font-weight: 500;
}
.friend-link-btn:hover {
  color: rgba(245,245,247,0.85);
  background: rgba(91,141,239,0.08);
  border-color: rgba(91,141,239,0.18);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91,141,239,0.10);
}

.copyright {
  color: rgba(245,245,247,0.35);
  font-size: 13px;
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

/* ========== 弹窗（友链） ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  width: 55rem;
  max-width: 92vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0,0,0,0.50);
  overflow: hidden;
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #F5F5F7;
  letter-spacing: 0.3px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: rgba(245,245,247,0.35);
  transition: all 0.2s;
}
.close-btn:hover {
  background: rgba(239,68,68,0.10);
  color: #ef4444;
}

.modal-body {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
}

/* 友链网格 */
.friend-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}

.friend-link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 10px 10px;
  background: rgba(255,255,255,0.03);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255,255,255,0.04);
}
.friend-link-card:hover {
  transform: translateY(-3px);
  background: rgba(255,255,255,0.05);
  border-color: rgba(91,141,239,0.12);
  box-shadow: 0 8px 24px rgba(0,0,0,0.30);
}

.friend-link-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.04);
}
.friend-link-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.friend-link-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(91,141,239,0.15);
  color: #5B8DEF;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
}

.friend-link-info h4 {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  color: rgba(245,245,247,0.60);
  text-align: center;
  line-height: 1.3;
  word-break: break-all;
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
  .footer { padding: 1.5rem 0 2rem; }
  .footer-content { gap: 16px; flex-direction: column; }
  .friend-link-btn { font-size: 0.7rem; padding: 5px 12px; }
  .copyright { font-size: 0.65rem; }
  .modal-header h3 { font-size: 1.05rem; }
  .modal-body { padding: 14px; }
  .friend-links-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .friend-link-card { padding: 10px 6px 8px; }
  .friend-link-logo { width: 40px; height: 40px; }
}
</style>
