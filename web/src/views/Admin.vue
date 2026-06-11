<template>
  <div v-if="!isLoggedIn" class="login-container">
    <div class="login-card">
      <h2 class="login-title">后台管理登录</h2>
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
            <svg v-if="showPassword" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2566d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2566d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47"/></svg>
          </span>
        </div>
        <div class="login-buttons">
          <button @click="goHome" class="back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回首页
          </button>
          <button @click="handleLogin" class="login-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
      </div>
    </div>
  </div>
  
  <div v-else class="admin-layout">
    <aside class="admin-sider" :class="{ open: siderOpen }" @click.self="closeSider">
      <div class="logo clickable" @click="page='welcome'; closeSider()"><span class="logo-icon">◆</span> Admin</div>
      <ul class="menu-list">
        <li :class="{active: page==='menu'}" @click="page='menu'; closeSider()"><span class="menu-icon">⊞</span> 栏目管理</li>
        <li :class="{active: page==='card'}" @click="page='card'; closeSider()"><span class="menu-icon">⊡</span> 卡片管理</li>
        <li :class="{active: page==='ad'}" @click="page='ad'; closeSider()"><span class="menu-icon">⊟</span> 广告管理</li>
        <li :class="{active: page==='friend'}" @click="page='friend'; closeSider()"><span class="menu-icon">⇲</span> 友链管理</li>
        <li :class="{active: page==='user'}" @click="page='user'; closeSider()"><span class="menu-icon">◎</span> 用户管理</li>
        <li :class="{active: page==='tools'}" @click="page='tools'; closeSider()"><span class="menu-icon">⚙</span> 工具箱</li>
      </ul>
    </aside>
    <main class="admin-main">
      <div class="admin-header">
        <button class="menu-toggle" @click="toggleSider">
          &#9776;
        </button>
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-actions">
          <span class="home-icon" @click="goHome" title="进入主页">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z" stroke="#2566d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <button class="btn logout-btn" @click="logout">退出登录</button>
        </div>
      </div>
      <div class="admin-content">
        <div v-if="page==='welcome'" class="welcome-page">
          <h2 class="welcome-title">欢迎您进入 Nav-Item 后台管理系统</h2>
          <div class="welcome-cards">
            <div class="welcome-card">
              <div class="welcome-icon time-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1abc9c" stroke-width="2"/><path d="M12 6v6l4 2" stroke="#1abc9c" stroke-width="2" stroke-linecap="round"/></svg>
              </div>
              <div class="welcome-label">上次登录时间</div>
              <div class="welcome-value">{{ lastLoginTime || '--' }}</div>
            </div>
            <div class="welcome-card">
              <div class="welcome-icon ip-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#1abc9c" stroke-width="2"/><path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" stroke="#1abc9c" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="#1abc9c"/></svg>
              </div>
              <div class="welcome-label">上次登录IP</div>
              <div class="welcome-value">{{ lastLoginIp || '--' }}</div>
            </div>
          </div>
        </div>
        <MenuManage v-if="page==='menu'" />
        <CardManage v-if="page==='card'" />
        <AdManage v-if="page==='ad'" />
        <FriendLinkManage v-if="page==='friend'" />
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
import AdManage from './admin/AdManage.vue';
import FriendLinkManage from './admin/FriendLinkManage.vue';
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
    case 'ad': return '广告管理';
    case 'friend': return '友链管理';
    case 'user': return '用户管理';
    case 'tools': return '工具箱';
    default: return '';
  }
});

onMounted(() => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
  if (isLoggedIn.value) {
    // 拉取用户信息
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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
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
  background: radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%);
  animation: loginBgShift 20s ease-in-out infinite alternate;
}
@keyframes loginBgShift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-2%, 2%); }
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  padding: 0 40px 40px;
  width: 400px;
  max-width: 90%;
  position: relative;
  animation: cardAppear 0.5s ease;
}
@keyframes cardAppear {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.login-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 28px;
  padding-top: 36px;
  letter-spacing: -0.5px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-input {
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  background: #f8fafc;
  color: #1e293b;
  height: 48px;
  line-height: 48px;
  box-sizing: border-box;
  width: 100%;
  transition: all 0.2s ease;
}
.login-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #fff;
}

.login-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.back-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
}
.back-btn:hover {
  background: #e2e8f0;
  color: #3b82f6;
  border-color: #cbd5e1;
}

.login-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 2;
}
.login-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.login-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.login-error {
  color: #ef4444;
  text-align: center;
  margin: 0;
  font-size: 14px;
  background: #fef2f2;
  padding: 8px 12px;
  border-radius: 8px;
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
  color: #3b82f6;
  margin: 0;
  padding: 0;
  z-index: 2;
  transition: color 0.2s;
}
.toggle-password:hover {
  color: #2563eb;
}

/* ========== 后台布局 ========== */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

/* ========== 侧边栏 ========== */
.admin-sider {
  width: 220px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding-top: 0;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  overflow-y: auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  padding: 24px 20px 20px;
  letter-spacing: 1px;
  color: #fff;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(59, 130, 246, 0.06);
}
.logo.clickable:hover {
  color: #60a5fa;
}

.menu-list {
  list-style: none;
  padding: 12px 0;
  margin: 0;
  flex: 1;
}
.menu-list li {
  padding: 14px 24px;
  margin: 2px 8px;
  cursor: pointer;
  font-size: 14px;
  border-radius: 10px;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}
.menu-list li:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
}
.menu-list li.active {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  font-weight: 600;
}

/* ========== 主内容区 ========== */
.admin-main {
  flex: 1;
  background: #f1f5f9;
  padding: 64px 0 0 220px;
  min-width: 0;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

/* ========== 顶栏 ========== */
.admin-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  padding: 0 32px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: fixed;
  top: 0;
  left: 220px;
  right: 0;
  z-index: 99;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1e293b;
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
  border-radius: 10px;
  transition: all 0.2s;
  padding: 8px;
  color: #64748b;
}
.home-icon:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.btn.logout-btn {
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn.logout-btn:hover {
  background: #ef4444;
  color: #fff;
}

/* ========== 内容区 ========== */
.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 0;
}

/* ========== 底部版权 ========== */
.admin-footer {
  margin-top: auto;
  text-align: center;
  padding: 2rem 0 1.5rem;
}
.admin-copyright {
  color: #94a3b8;
  font-size: 13px;
  margin: 0;
}
.admin-footer .footer-link {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}
.admin-footer .footer-link:hover {
  color: #3b82f6;
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
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 36px;
  letter-spacing: -0.3px;
}
.welcome-cards {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  justify-content: center;
}
.welcome-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  padding: 28px 36px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}
.welcome-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}
.welcome-icon {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.welcome-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 6px;
  font-weight: 500;
}
.welcome-value {
  font-size: 1.6rem;
  color: #10b981;
  font-weight: 700;
  letter-spacing: 0.5px;
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
  .admin-sider {
    width: 75vw;
    max-width: 280px;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  }
  .admin-sider.open {
    transform: translateX(0);
  }
  .admin-main {
    padding: 60px 0 0 0 !important;
  }
  .admin-header {
    left: 0 !important;
    width: 100vw !important;
    padding: 0 12px !important;
    height: 56px;
  }
  .header-title {
    font-size: 1rem !important;
    text-align: left !important;
    margin-left: 0 !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .btn.logout-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  .menu-toggle {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    background: rgba(59, 130, 246, 0.06);
    border: 1px solid rgba(59, 130, 246, 0.12);
    border-radius: 10px;
    font-size: 1.4rem;
    cursor: pointer;
    color: #3b82f6;
    z-index: 300;
    transition: all 0.2s;
    margin-right: 8px;
  }
  .menu-toggle:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  .admin-content {
    padding: 16px 12px 0;
  }
  .welcome-page {
    margin-top: 24px;
  }
  .welcome-cards {
    gap: 16px;
  }
  .welcome-card {
    padding: 20px 24px;
    min-width: 0;
    width: 100%;
  }
}
</style> 