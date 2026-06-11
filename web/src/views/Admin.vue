<template>
  <div v-if="!isLoggedIn" class="login-container">
    <div class="login-card">
      <div class="login-decoration"></div>
      <h2 class="login-title">后台管理</h2>
      <p class="login-subtitle">Nav-Item 管理系统</p>
      <div class="login-form">
        <input v-model="username" type="text" placeholder="用户名" class="login-input" @keyup.enter="handleLogin" />
        <div class="password-input-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="密码"
            class="login-input password-input"
            @keyup.enter="handleLogin"
          />
          <span class="toggle-password" @click="showPassword = !showPassword">
            <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
          </span>
        </div>
        <button @click="handleLogin" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <button @click="goHome" class="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回首页
        </button>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
      </div>
    </div>
  </div>

  <div v-else class="admin-layout">
    <aside class="admin-sider" :class="{ open: siderOpen }">
      <!-- 遮罩层 -->
      <div class="sider-overlay" @click="closeSider"></div>
      <div class="sider-inner">
        <div class="logo" @click="page='welcome'; closeSider()">
          <span class="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </span>
          Admin
        </div>
        <ul class="menu-list">
          <li :class="{active: page==='menu'}" @click="page='menu'; closeSider()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>
            栏目管理
          </li>
          <li :class="{active: page==='card'}" @click="page='card'; closeSider()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
            卡片管理
          </li>
          <li :class="{active: page==='user'}" @click="page='user'; closeSider()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
            用户管理
          </li>
          <li :class="{active: page==='tools'}" @click="page='tools'; closeSider()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            工具箱
          </li>
        </ul>
      </div>
    </aside>
    <main class="admin-main">
      <div class="admin-header">
        <button class="menu-toggle" @click="toggleSider">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-actions">
          <span class="home-icon" @click="goHome" title="进入主页">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <button class="btn logout-btn" @click="logout">退出登录</button>
        </div>
      </div>
      <div class="admin-content">
        <div v-if="page==='welcome'" class="welcome-page">
          <h2 class="welcome-title">欢迎回来</h2>
          <div class="welcome-cards">
            <div class="welcome-card">
              <div class="welcome-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </div>
              <div class="welcome-label">上次登录时间</div>
              <div class="welcome-value">{{ lastLoginTime || '--' }}</div>
            </div>
            <div class="welcome-card">
              <div class="welcome-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
              </div>
              <div class="welcome-label">上次登录IP</div>
              <div class="welcome-value">{{ lastLoginIp || '--' }}</div>
            </div>
          </div>
        </div>
        <MenuManage v-if="page==='menu'" />
        <CardManage v-if="page==='card'" />
        <UserManage v-if="page==='user'" />
        <ToolBox v-if="page==='tools'" />
      </div>
      <footer class="admin-footer">
        <p class="admin-copyright">Copyright © 2025 Nav-Item | <a href="https://github.com/eooce/Nav-Item" target="_blank" class="footer-link">Powered by eooce</a></p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { login } from '../api';
import MenuManage from './admin/MenuManage.vue';
import CardManage from './admin/CardManage.vue';
import UserManage from './admin/UserManage.vue';
import ToolBox from './admin/ToolBox.vue';

const page = ref('welcome');
const lastLoginTime = ref('');
const lastLoginIp = ref('');
const isLoggedIn = ref(false);
const username = ref('');
const password = ref('');
const loading = ref(false);
const loginError = ref('');
const showPassword = ref(false);
const siderOpen = ref(false);

const pageTitle = computed(() => {
  switch (page.value) {
    case 'menu': return '栏目管理';
    case 'card': return '卡片管理';
    case 'user': return '用户管理';
    case 'tools': return '工具箱';
    default: return '';
  }
});

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
  if (isLoggedIn.value) {
    fetchLastLoginInfo();
  }
});
async function fetchLastLoginInfo() {
  try {
    const res = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) {
      const data = await res.json();
      lastLoginTime.value = data.last_login_time || '';
      lastLoginIp.value = data.last_login_ip || '';
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
}

async function handleLogin() {
  if (!username.value || !password.value) {
    loginError.value = '请输入用户名和密码';
    return;
  }

  loading.value = true;
  loginError.value = '';

  try {
    const response = await login(username.value, password.value);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      isLoggedIn.value = true;
      lastLoginTime.value = response.data.lastLoginTime || '';
      lastLoginIp.value = response.data.lastLoginIp || '';
    }
  } catch (error) {
    loginError.value = error.response?.data?.message || '登录失败，请检查用户名和密码';
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  username.value = '';
  password.value = '';
  loginError.value = '';
}

function goHome() {
  window.open('/', '_blank');
}
function toggleSider() {
  siderOpen.value = !siderOpen.value;
}
function closeSider() {
  siderOpen.value = false;
}
</script>

<style scoped>
/* ========== 登录页 ========== */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #121212;
  position: relative;
  overflow: hidden;
}
.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at 20% 50%, rgba(91,141,239,0.06) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 50%, rgba(91,141,239,0.04) 0%, transparent 50%);
  animation: loginBgShift 20s ease-in-out infinite alternate;
}
@keyframes loginBgShift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-2%, 2%); }
}

.login-card {
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0,0,0,0.50);
  padding: 0 36px 36px;
  width: 400px;
  max-width: 90%;
  position: relative;
  overflow: hidden;
  animation: cardAppear 0.5s ease;
}
@keyframes cardAppear {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.login-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(91,141,239,0.40), #5B8DEF, rgba(91,141,239,0.40), transparent);
}

.login-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #F5F5F7;
  margin-bottom: 4px;
  padding-top: 36px;
  letter-spacing: 0.5px;
}

.login-subtitle {
  text-align: center;
  font-size: 13px;
  color: rgba(245,245,247,0.30);
  margin: 0 0 28px;
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login-input {
  padding: 12px 16px;
  border: 1.5px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  font-size: 14px;
  background: rgba(255,255,255,0.04);
  color: #F5F5F7;
  height: 48px;
  line-height: 48px;
  box-sizing: border-box;
  width: 100%;
  transition: all 0.2s ease;
}
.login-input::placeholder {
  color: rgba(245,245,247,0.25);
}
.login-input:focus {
  outline: none;
  border-color: rgba(91,141,239,0.30);
  background: rgba(255,255,255,0.06);
  box-shadow: 0 0 0 3px rgba(91,141,239,0.06);
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}
.password-input {
  padding-right: 48px;
}
.toggle-password {
  position: absolute;
  top: 0;
  right: 0;
  height: 48px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(245,245,247,0.30);
  margin: 0;
  padding: 0;
  z-index: 2;
  transition: color 0.2s;
}
.toggle-password:hover {
  color: rgba(245,245,247,0.60);
}

.login-btn {
  background: linear-gradient(135deg, rgba(91,141,239,0.60), rgba(91,141,239,0.40));
  color: #F5F5F7;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: 4px;
  position: relative;
  overflow: hidden;
}
.login-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #5B8DEF, #7BA4F9);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 12px;
}
.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(91,141,239,0.25);
}
.login-btn:hover:not(:disabled)::before {
  opacity: 1;
}
.login-btn:disabled {
  background: rgba(255,255,255,0.06);
  color: rgba(245,245,247,0.25);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.login-btn span {
  position: relative;
  z-index: 1;
}

.back-btn {
  background: rgba(255,255,255,0.03);
  color: rgba(245,245,247,0.45);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
.back-btn:hover {
  background: rgba(255,255,255,0.05);
  color: rgba(245,245,247,0.70);
  border-color: rgba(255,255,255,0.10);
}

.login-error {
  color: #ef4444;
  text-align: center;
  margin: 0;
  font-size: 13px;
  background: rgba(239,68,68,0.08);
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(239,68,68,0.12);
}

/* ========== 后台布局 ========== */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #121212;
}

/* ========== 侧边栏 ========== */
.admin-sider {
  width: 240px;
  flex-shrink: 0;
  z-index: 100;
}

.sider-inner {
  width: 240px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: #16161a;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.04);
  overflow-y: auto;
}

.sider-overlay {
  display: none;
}

.logo {
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 24px 18px;
  letter-spacing: 0.5px;
  color: #F5F5F7;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: color 0.2s;
}
.logo:hover {
  color: #5B8DEF;
}
.logo-icon {
  color: #5B8DEF;
  display: flex;
  align-items: center;
}

.menu-list {
  list-style: none;
  padding: 12px 10px;
  margin: 0;
  flex: 1;
}
.menu-list li {
  padding: 10px 14px;
  margin: 2px 0;
  cursor: pointer;
  font-size: 13px;
  border-radius: 10px;
  transition: all 0.2s ease;
  color: rgba(245,245,247,0.40);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}
.menu-list li svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.5;
}
.menu-list li:hover {
  background: rgba(255,255,255,0.04);
  color: rgba(245,245,247,0.65);
}
.menu-list li:hover svg {
  opacity: 0.7;
}
.menu-list li.active {
  background: rgba(91,141,239,0.10);
  color: #5B8DEF;
  font-weight: 600;
}
.menu-list li.active svg {
  opacity: 1;
  color: #5B8DEF;
}

/* ========== 主内容区 ========== */
.admin-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding-top: 64px;
}

/* ========== 顶栏 ========== */
.admin-header {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 32px;
  background: rgba(18,18,18,0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: fixed;
  top: 0;
  left: 240px;
  right: 0;
  z-index: 99;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: rgba(245,245,247,0.55);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-icon {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  padding: 8px;
  color: rgba(245,245,247,0.30);
}
.home-icon:hover {
  background: rgba(255,255,255,0.04);
  color: rgba(245,245,247,0.65);
}

.btn.logout-btn {
  background: rgba(239,68,68,0.06);
  color: rgba(239,68,68,0.60);
  border: 1px solid rgba(239,68,68,0.10);
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn.logout-btn:hover {
  background: rgba(239,68,68,0.12);
  color: #ef4444;
  border-color: rgba(239,68,68,0.20);
}

/* ========== 内容区 ========== */
.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 28px 0;
}

/* ========== 底部版权 ========== */
.admin-footer {
  margin-top: auto;
  text-align: center;
  padding: 2rem 0 1.5rem;
}
.admin-copyright {
  color: rgba(245,245,247,0.18);
  font-size: 12px;
  margin: 0;
}
.admin-footer .footer-link {
  color: rgba(245,245,247,0.22);
  text-decoration: none;
  transition: color 0.2s;
}
.admin-footer .footer-link:hover {
  color: rgba(245,245,247,0.50);
}

/* ========== 欢迎页 ========== */
.welcome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
  width: 100%;
}
.welcome-title {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 600;
  color: #F5F5F7;
  margin-bottom: 32px;
  letter-spacing: -0.3px;
}
.welcome-cards {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}
.welcome-card {
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.20);
  padding: 28px 32px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.welcome-card:hover {
  border-color: rgba(91,141,239,0.10);
  box-shadow: 0 8px 32px rgba(0,0,0,0.30);
  transform: translateY(-3px);
}
.welcome-icon {
  width: 44px;
  height: 44px;
  background: rgba(91,141,239,0.08);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  color: #5B8DEF;
}
.welcome-label {
  font-size: 13px;
  color: rgba(245,245,247,0.40);
  margin-bottom: 6px;
  font-weight: 500;
}
.welcome-value {
  font-size: 1.3rem;
  color: #5B8DEF;
  font-weight: 600;
  letter-spacing: 0.3px;
  word-break: break-all;
}

/* ========== 移动端菜单切换按钮 ========== */
.menu-toggle {
  display: none;
}

/* ========== 响应式 ========== */
@media (max-width: 900px) {
  .welcome-cards {
    flex-direction: column;
    align-items: center;
  }
  .welcome-card {
    min-width: 200px;
    width: 90vw;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .sider-inner {
    width: 75vw;
    max-width: 280px;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 24px rgba(0,0,0,0.35);
  }
  .admin-sider.open .sider-inner {
    transform: translateX(0);
  }
  .sider-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.50);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
  }
  .admin-sider.open .sider-overlay {
    opacity: 1;
    visibility: visible;
  }
  .admin-main {
    padding-top: 56px;
  }
  .admin-header {
    left: 0;
    width: 100vw;
    padding: 0 12px;
    height: 56px;
  }
  .header-title {
    font-size: 0.9rem;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .btn.logout-btn {
    padding: 5px 10px;
    font-size: 11px;
  }
  .menu-toggle {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
    cursor: pointer;
    color: rgba(245,245,247,0.50);
    z-index: 300;
    transition: all 0.2s;
    margin-right: 6px;
  }
  .menu-toggle:hover {
    background: rgba(255,255,255,0.06);
  }
  .admin-content {
    padding: 20px 16px 0;
  }
  .welcome-page {
    margin-top: 24px;
  }
  .welcome-cards {
    gap: 16px;
  }
  .welcome-card {
    padding: 20px 22px;
    min-width: 0;
    width: 100%;
  }
}
</style>
