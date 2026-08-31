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
            aria-label="搜索关键词"
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
      <a v-for="ad in leftAds" :key="ad.id" :href="ad.url" target="_blank" rel="noopener noreferrer">
        <img :src="ad.img" alt="广告" />
      </a>
    </div>
    <!-- 右侧广告条 -->
    <div v-if="rightAds.length" class="ad-space-fixed right-ad-fixed">
      <a v-for="ad in rightAds" :key="ad.id" :href="ad.url" target="_blank" rel="noopener noreferrer">
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
              rel="noopener noreferrer"
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
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function handleLogoError(event) {
  if (!event.target.src.endsWith('/default-favicon.png')) {
    event.target.src = '/default-favicon.png';
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 72px;
  position: relative;
  background:
    radial-gradient(circle at 50% 18%, rgba(111,145,232,0.045), transparent 32rem),
    var(--bg-base);
}

.menu-bar-fixed {
  width: 100%;
  position: absolute;
  top: 18px;
  left: 0;
  z-index: 100;
}

.search-section {
  display: flex;
  justify-content: center;
  padding: 3.4rem 1rem 2.15rem;
  position: relative;
  z-index: 2;
}

.search-box-wrapper {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search-engine-select {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 11px;
}

.engine-btn {
  min-height: 34px;
  padding: 6px 16px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--bg-raised);
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: color 180ms ease, background 180ms ease, border-color 180ms ease;
}

.engine-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-overlay);
}

.engine-btn.active {
  color: var(--text-primary);
  background: var(--accent-soft);
  border-color: rgba(111,145,232,0.3);
}

.search-container {
  width: 100%;
  min-height: 62px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 7px 6px 21px;
  border: 1px solid var(--border-default);
  border-radius: 18px;
  background: var(--bg-raised);
  box-shadow: 0 12px 36px rgba(0,0,0,0.28);
  transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.search-container:focus-within {
  border-color: rgba(111,145,232,0.42);
  background: var(--bg-overlay);
  box-shadow: 0 14px 42px rgba(0,0,0,0.36), 0 0 0 3px rgba(111,145,232,0.06);
}

.search-input {
  min-width: 0;
  flex: 1;
  padding: 10px 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
}

.search-input::placeholder { color: var(--text-tertiary); }

.clear-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
}

.clear-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
.clear-btn svg { width: 17px; height: 17px; }

.search-btn {
  width: 50px;
  height: 50px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 0;
  border-radius: 14px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(45,72,140,0.28);
  transition: transform 180ms var(--ease-out), filter 180ms ease, box-shadow 180ms ease;
}

.search-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
  box-shadow: 0 10px 24px rgba(45,72,140,0.38);
}

.search-btn:active { transform: translateY(0) scale(0.98); }

.ad-space-fixed {
  width: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: fixed;
  top: 13rem;
  z-index: 10;
}

.left-ad-fixed { left: 12px; }
.right-ad-fixed { right: 12px; }

.ad-space-fixed a {
  width: 100%;
  display: block;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 13px;
  background: var(--bg-raised);
  transition: transform 180ms var(--ease-out), border-color 180ms ease;
}

.ad-space-fixed a:hover {
  transform: translateY(-2px);
  border-color: var(--border-default);
}

.ad-space-fixed img {
  width: 100%;
  max-height: 150px;
  display: block;
  object-fit: cover;
}

.footer {
  margin-top: auto;
  padding: 3rem 1rem 2rem;
  position: relative;
  z-index: 2;
  text-align: center;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 18px 34px;
}

.friend-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  background: var(--bg-raised);
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: color 180ms ease, background 180ms ease, border-color 180ms ease;
}

.friend-link-btn:hover {
  color: var(--text-primary);
  background: var(--bg-overlay);
  border-color: var(--border-default);
}

.copyright {
  margin: 0;
  color: var(--text-tertiary);
  font-size: 11px;
}

.footer-link {
  color: inherit;
  text-decoration: none;
}

.footer-link:hover { color: var(--text-secondary); }

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(5,7,10,0.76);
  backdrop-filter: blur(9px);
  animation: fade-in 160ms ease;
}

.modal-content {
  width: min(720px, 100%);
  max-height: min(650px, 84vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 20px;
  background: var(--bg-overlay);
  box-shadow: 0 28px 90px rgba(0,0,0,0.58);
  animation: dialog-in 220ms var(--ease-out);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 19px 22px;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
}

.close-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
}

.close-btn:hover {
  border-color: rgba(239,68,68,0.15);
  background: var(--danger-soft);
  color: var(--danger);
}

.modal-body {
  overflow-y: auto;
  padding: 20px 22px 23px;
}

.friend-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
  gap: 10px;
}

.friend-link-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 16px 10px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: var(--bg-raised);
  color: inherit;
  text-decoration: none;
  transition: transform 180ms var(--ease-out), border-color 180ms ease, background 180ms ease;
}

.friend-link-card:hover {
  transform: translateY(-2px);
  border-color: rgba(111,145,232,0.24);
  background: var(--bg-hover);
}

.friend-link-logo {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: 11px;
  background: #101217;
}

.friend-link-logo img { width: 25px; height: 25px; object-fit: contain; }

.friend-link-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 16px;
  font-weight: 700;
}

.friend-link-info { min-width: 0; width: 100%; }

.friend-link-info h4 {
  overflow: hidden;
  margin: 0;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes fade-in { from { opacity: 0; } }
@keyframes dialog-in { from { opacity: 0; transform: translateY(8px) scale(0.985); } }

@media (max-width: 1320px) {
  .ad-space-fixed { display: none; }
}

@media (max-width: 768px) {
  .home-container { padding-top: 92px; }
  .menu-bar-fixed { top: 12px; }
  .search-section { padding: 2rem 0.75rem 1.55rem; }
  .search-engine-select {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
  }
  .search-engine-select::-webkit-scrollbar { display: none; }
  .engine-btn { flex: 0 0 auto; min-height: 31px; padding: 5px 13px; font-size: 11px; }
  .search-container { min-height: 54px; padding: 5px 5px 5px 15px; border-radius: 15px; }
  .search-input { font-size: 14px; }
  .search-btn { width: 44px; height: 44px; border-radius: 12px; }
  .footer { padding-top: 2.2rem; }
  .footer-content { flex-direction: column; gap: 12px; }
  .modal-body { padding: 14px; }
  .friend-links-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
}

@media (max-width: 420px) {
  .home-container { padding-top: 122px; }
  .friend-links-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-content { animation: none; }
}
</style>
