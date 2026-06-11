<template>
  <div class="friend-manage">
    <div class="friend-header"></div>
    <div class="friend-add">
      <input v-model="newTitle" placeholder="网站名" class="input" />
      <input v-model="newUrl" placeholder="网站链接" class="input" />
      <input v-model="newLogo" placeholder="logo链接(可选)" class="input" />
      <button class="btn" @click="addFriend">添加友链</button>
    </div>
    <div class="friend-card">
      <table class="friend-table">
        <thead><tr><th>网站名</th><th>链接</th><th>Logo</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="f in friends" :key="f.id">
            <td><input v-model="f.title" @blur="updateFriend(f)" class="input" /></td>
            <td><input v-model="f.url" @blur="updateFriend(f)" class="input" /></td>
            <td><input v-model="f.logo" @blur="updateFriend(f)" class="input" placeholder="logo链接(可选)" /></td>
            <td><button class="btn btn-danger" @click="deleteFriend(f.id)">删除</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFriends, addFriend as apiAddFriend, updateFriend as apiUpdateFriend, deleteFriend as apiDeleteFriend } from '../../api';

const friends = ref([]);
const newTitle = ref('');
const newUrl = ref('');
const newLogo = ref('');

onMounted(loadFriends);

async function loadFriends() {
  const res = await getFriends();
  friends.value = res.data;
}
async function addFriend() {
  if (!newTitle.value || !newUrl.value) return;
  await apiAddFriend({ title: newTitle.value, url: newUrl.value, logo: newLogo.value });
  newTitle.value = '';
  newUrl.value = '';
  newLogo.value = '';
  loadFriends();
}
async function updateFriend(f) {
  await apiUpdateFriend(f.id, { title: f.title, url: f.url, logo: f.logo });
  loadFriends();
}
async function deleteFriend(id) {
  await apiDeleteFriend(id);
  loadFriends();
}
</script>

<style scoped>
.friend-manage {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.friend-header {
  height: 16px;
}

.friend-add {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 18px 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}

.friend-card {
  width: 100%;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  padding: 20px;
  box-sizing: border-box;
  overflow-x: auto;
}

.input {
  padding: 9px 12px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #1e293b;
  font-size: 0.88rem;
  transition: all 0.2s ease;
  height: 38px;
  min-width: 160px;
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 20px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  height: 38px;
}
.btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-danger {
  background: #fee2e2;
  color: #ef4444;
}
.btn-danger:hover {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.friend-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  color: #1e293b;
  border-radius: 10px;
  overflow: hidden;
  min-width: 500px;
}
.friend-table th,
.friend-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
  height: auto;
}
.friend-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.friend-table td input {
  width: 95%;
  min-width: 100px;
  background: #f8fafc;
  color: #1e293b;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  height: 32px;
  transition: all 0.2s;
  box-sizing: border-box;
}
.friend-table td input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.06);
}
.friend-table th:last-child,
.friend-table td:last-child {
  text-align: center;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .friend-manage {
    width: 100%;
  }
  .friend-add {
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    border-radius: 12px;
  }
  .friend-card {
    padding: 12px;
    border-radius: 12px;
  }
  .input {
    width: 100%;
    min-width: 0;
  }
  .btn {
    width: 100%;
  }
  .friend-table th,
  .friend-table td {
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style> 