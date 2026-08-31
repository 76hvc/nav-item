<template>
  <main class="quick-add-page">
    <section class="quick-add-card" aria-labelledby="quick-add-title">
      <p class="eyebrow">NAV ITEM · QUICK CAPTURE</p>
      <h1 id="quick-add-title">收藏当前页面</h1>
      <p class="intro">确认标题和分类后保存。登录信息只在导航站域名内使用，不会发送给当前网页。</p>

      <form v-if="!isLoggedIn" class="form-stack" @submit.prevent="handleLogin">
        <label>
          <span>用户名</span>
          <input v-model.trim="username" autocomplete="username" required />
        </label>
        <label>
          <span>密码</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>
        <button class="primary-button" :disabled="busy">
          {{ busy ? '正在登录…' : '登录后继续' }}
        </button>
      </form>

      <form v-else class="form-stack" @submit.prevent="saveCard">
        <label>
          <span>标题</span>
          <input v-model.trim="title" maxlength="150" required />
        </label>
        <label>
          <span>网址</span>
          <input v-model.trim="url" type="url" required />
        </label>
        <label>
          <span>保存到</span>
          <select v-model="destination" required>
            <template v-for="menu in menus" :key="menu.id">
              <option :value="`${menu.id}:`">{{ menu.name }}</option>
              <option
                v-for="subMenu in menu.subMenus"
                :key="`${menu.id}-${subMenu.id}`"
                :value="`${menu.id}:${subMenu.id}`"
              >
                {{ menu.name }} / {{ subMenu.name }}
              </option>
            </template>
          </select>
        </label>
        <label>
          <span>图标地址 <small>可选</small></span>
          <input v-model.trim="icon" type="url" />
        </label>

        <p v-if="message" :class="['status', status]" role="status">{{ message }}</p>

        <div class="actions">
          <button type="button" class="secondary-button" @click="closeWindow">取消</button>
          <button class="primary-button" :disabled="busy || !destination">
            {{ busy ? '正在保存…' : '保存到导航站' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { addCard, getMenus, login } from '../api';

const route = useRoute();
const isLoggedIn = ref(Boolean(localStorage.getItem('token')));
const username = ref('');
const password = ref('');
const title = ref(String(route.query.title || ''));
const url = ref(String(route.query.url || ''));
const icon = ref(String(route.query.icon || ''));
const menus = ref([]);
const destination = ref('');
const busy = ref(false);
const message = ref('');
const status = ref('');

onMounted(() => {
  if (isLoggedIn.value) loadMenus();
});

async function loadMenus() {
  try {
    const response = await getMenus();
    menus.value = response.data;
    if (!destination.value && menus.value.length) {
      destination.value = `${menus.value[0].id}:`;
    }
  } catch {
    message.value = '分类加载失败，请刷新后重试。';
    status.value = 'error';
  }
}

async function handleLogin() {
  busy.value = true;
  message.value = '';
  try {
    const response = await login(username.value, password.value);
    localStorage.setItem('token', response.data.token);
    isLoggedIn.value = true;
    await loadMenus();
  } catch (error) {
    message.value = error.response?.data?.message || '登录失败，请检查账号和密码。';
    status.value = 'error';
  } finally {
    busy.value = false;
  }
}

async function saveCard() {
  const [menuId, subMenuId] = destination.value.split(':');
  busy.value = true;
  message.value = '';
  try {
    await addCard({
      menu_id: Number(menuId),
      sub_menu_id: subMenuId ? Number(subMenuId) : null,
      title: title.value,
      url: url.value,
      logo_url: icon.value,
      desc: '',
      order: 0
    });
    message.value = '已保存，可以关闭这个窗口。';
    status.value = 'success';
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      isLoggedIn.value = false;
      message.value = '登录已过期，请重新登录。';
    } else {
      message.value = error.response?.data?.message || '保存失败，请稍后重试。';
    }
    status.value = 'error';
  } finally {
    busy.value = false;
  }
}

function closeWindow() {
  window.close();
  if (!window.closed) window.location.href = '/';
}
</script>

<style scoped>
.quick-add-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
  background: #101217;
  color: #f4f6fb;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.quick-add-card {
  width: min(100%, 480px);
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  background: #191c23;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.36);
}

.eyebrow {
  margin: 0 0 12px;
  color: #87a7ff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

h1 { margin: 0; font-size: clamp(28px, 7vw, 38px); }
.intro { margin: 12px 0 28px; color: #9da4b3; line-height: 1.65; }
.form-stack { display: grid; gap: 18px; }
label { display: grid; gap: 8px; }
label span { color: #cdd2dd; font-size: 13px; font-weight: 600; }
label small { color: #777f90; font-weight: 400; }

input,
select {
  width: 100%;
  box-sizing: border-box;
  min-height: 46px;
  padding: 0 13px;
  border: 1px solid #343946;
  border-radius: 11px;
  outline: none;
  background: #12151b;
  color: inherit;
}

input:focus,
select:focus { border-color: #7e9fff; box-shadow: 0 0 0 3px rgba(126, 159, 255, 0.15); }
.actions { display: grid; grid-template-columns: 1fr 1.5fr; gap: 10px; }
button { min-height: 46px; border: 0; border-radius: 11px; cursor: pointer; font-weight: 700; }
button:disabled { cursor: wait; opacity: 0.62; }
.primary-button { background: #7e9fff; color: #0c1220; }
.secondary-button { background: #292e39; color: #d9deea; }
.status { margin: 0; padding: 11px 13px; border-radius: 10px; font-size: 13px; }
.status.success { background: rgba(70, 190, 135, 0.12); color: #83d9ad; }
.status.error { background: rgba(240, 99, 99, 0.12); color: #ff9b9b; }

@media (max-width: 520px) {
  .quick-add-page { padding: 14px; }
  .quick-add-card { padding: 24px 20px; border-radius: 18px; }
}
</style>
