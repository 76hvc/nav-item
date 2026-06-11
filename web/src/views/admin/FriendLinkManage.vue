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

.friend-header { height: 12px; }

.friend-add {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 14px;
  padding: 16px 24px;
  box-sizing: border-box;
}

.friend-card {
  width: 100%;
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 14px;
  padding: 16px;
  box-sizing: border-box;
  overflow-x: auto;
}

.input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  color: #F5F5F7;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  height: 36px;
  min-width: 140px;
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: rgba(91,141,239,0.25);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 0 2px rgba(91,141,239,0.06);
}
.input::placeholder { color: rgba(245,245,247,0.20); }

.btn {
  background: rgba(91,141,239,0.50);
  color: #F5F5F7;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  height: 36px;
}
.btn:hover {
  background: #5B8DEF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91,141,239,0.20);
}

.btn-danger {
  background: rgba(239,68,68,0.08);
  color: rgba(239,68,68,0.65);
}
.btn-danger:hover {
  background: rgba(239,68,68,0.12);
  color: #ef4444;
  box-shadow: none;
}

.friend-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 10px;
  overflow: hidden;
  min-width: 500px;
}
.friend-table th,
.friend-table td {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  height: auto;
  color: rgba(245,245,247,0.65);
  font-size: 13px;
}
.friend-table th {
  background: rgba(255,255,255,0.02);
  font-weight: 600;
  color: rgba(245,245,247,0.40);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.friend-table td input {
  width: 95%;
  min-width: 80px;
  background: rgba(255,255,255,0.02);
  color: rgba(245,245,247,0.70);
  border: 1.5px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 13px;
  height: 30px;
  transition: all 0.2s;
  box-sizing: border-box;
}
.friend-table td input:focus {
  outline: none;
  border-color: rgba(91,141,239,0.20);
  background: rgba(255,255,255,0.04);
}
.friend-table th:last-child,
.friend-table td:last-child {
  text-align: center;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .friend-manage { width: 100%; }
  .friend-add {
    flex-direction: column;
    gap: 6px;
    padding: 14px;
    border-radius: 10px;
  }
  .friend-card { padding: 10px; border-radius: 10px; }
  .input { width: 100%; min-width: 0; }
  .btn { width: 100%; }
  .friend-table th,
  .friend-table td { padding: 8px 10px; font-size: 11px; }
}
</style> 