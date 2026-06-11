<template>
  <div class="user-manage">
    <div class="user-header">
    </div>
    
    <div class="user-card">
      <div class="password-section">
        <h3 class="section-title">修改密码</h3>
        <div class="password-form">
          <div class="form-group">
            <label>当前密码：</label>
            <input v-model="oldPassword" type="password" placeholder="请输入当前密码" class="input" />
          </div>
          <div class="form-group">
            <label>新密码：</label>
            <input v-model="newPassword" type="password" placeholder="请输入新密码" class="input" />
          </div>
          <div class="form-group">
            <label>确认新密码：</label>
            <input v-model="confirmPassword" type="password" placeholder="请再次输入新密码" class="input" />
          </div>
          <div class="form-actions">
            <button @click="handleChangePassword" class="btn" :disabled="loading">
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
      message.value = '2秒后自动退出登录,请使用新密码重新登录...';
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
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  padding: 28px 32px;
}

.section-title {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
}

.password-section {
  margin-bottom: 16px;
}

.password-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.input {
  width: 100%;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  color: #1e293b;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
  background: #fff;
}

.form-actions {
  text-align: center;
  margin-top: 28px;
}

.btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 32px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s;
}
.btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}
.btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  text-align: center;
}
.message.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}
.message.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

@media (max-width: 768px) {
  .user-manage {
    width: 100%;
  }
  .user-card {
    padding: 20px 16px;
    border-radius: 12px;
  }
  .section-title {
    font-size: 1.1rem;
  }
  .btn {
    width: 100%;
  }
}
</style> 