<template>
  <div class="user-manage">
    <div class="user-card">
      <div class="password-section">
        <h3 class="section-title">修改密码</h3>
        <div class="password-form">
          <div class="form-group">
            <label>当前密码</label>
            <input v-model="oldPassword" type="password" placeholder="请输入当前密码" class="input" />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input v-model="newPassword" type="password" placeholder="请输入新密码" class="input" />
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input v-model="confirmPassword" type="password" placeholder="请再次输入新密码" class="input" />
          </div>
          <div class="form-actions">
            <button @click="handleChangePassword" class="btn btn-primary" :disabled="loading">
              {{ loading ? '修改中...' : '修改密码' }}
            </button>
          </div>
          <p v-if="message" :class="['message', messageType]">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserProfile, changePassword } from '../../api';

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const message = ref('');
const messageType = ref('success');
const userInfo = ref({});

onMounted(async () => {
  try {
    const response = await getUserProfile();
    userInfo.value = response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
});

async function handleChangePassword() {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    showMessage('请填写所有密码字段', 'error');
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    showMessage('两次输入的新密码不一致', 'error');
    return;
  }

  if (newPassword.value.length < 6) {
    showMessage('新密码长度至少6位', 'error');
    return;
  }

  loading.value = true;
  message.value = '';

  try {
    await changePassword(oldPassword.value, newPassword.value);
    showMessage('密码修改成功', 'success');
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (error) {
    showMessage(error.response?.data?.message || '密码修改失败', 'error');
  } finally {
    loading.value = false;
  }
}

function showMessage(text, type) {
  message.value = text;
  messageType.value = type;
  if (text === '密码修改成功' && type === 'success') {
    setTimeout(() => {
      message.value = '2秒后自动退出登录，请使用新密码重新登录...';
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.reload();
      }, 2000);
    }, 500);
  } else {
    setTimeout(() => {
      message.value = '';
    }, 3000);
  }
}
</script>

<style scoped>
.user-manage {
  max-width: 700px;
  width: 95%;
  margin: 0 auto;
}

.user-card {
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 18px;
  padding: 28px 32px;
}

.section-title {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #F5F5F7;
  margin: 0 0 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.password-section {
  margin-bottom: 12px;
}

.password-form {
  max-width: 450px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: rgba(245,245,247,0.50);
  font-size: 13px;
}

.input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  color: #F5F5F7;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.input::placeholder { color: rgba(245,245,247,0.20); }
.input:focus {
  outline: none;
  border-color: rgba(91,141,239,0.25);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 0 3px rgba(91,141,239,0.06);
}

.form-actions {
  text-align: center;
  margin-top: 24px;
}

.btn {
  padding: 10px 28px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: rgba(91,141,239,0.50);
  color: #F5F5F7;
}
.btn-primary:hover:not(:disabled) {
  background: #5B8DEF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91,141,239,0.20);
}
.btn:disabled {
  background: rgba(255,255,255,0.04);
  color: rgba(245,245,247,0.20);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.message {
  margin-top: 14px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}
.message.success {
  background: rgba(22,163,74,0.08);
  color: rgba(22,163,74,0.70);
  border: 1px solid rgba(22,163,74,0.12);
}
.message.error {
  background: rgba(239,68,68,0.08);
  color: rgba(239,68,68,0.70);
  border: 1px solid rgba(239,68,68,0.12);
}

@media (max-width: 768px) {
  .user-manage { width: 100%; }
  .user-card { padding: 18px 20px; border-radius: 14px; }
  .section-title { font-size: 1rem; }
  .btn { width: 100%; }
}
</style>
