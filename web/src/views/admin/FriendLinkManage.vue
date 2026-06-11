<template>
  <div class="friend-manage">
    <div class="friend-add">
      <input v-model="newTitle" placeholder="网站名" class="input narrow" />
      <input v-model="newUrl" placeholder="网站链接" class="input wide" />
      <input v-model="newLogo" placeholder="logo链接(可选)" class="input wide" />
      <button class="btn btn-primary" @click="addFriend">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        添加友链
      </button>
    </div>
    <div class="friend-card">
      <table class="friend-table">
        <thead><tr><th>网站名</th><th>链接</th><th>Logo</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="f in friends" :key="f.id">
            <td><input v-model="f.title" @blur="updateFriend(f)" class="table-input" /></td>
            <td><input v-model="f.url" @blur="updateFriend(f)" class="table-input" /></td>
            <td><input v-model="f.logo" @blur="updateFriend(f)" class="table-input" placeholder="logo链接(可选)" /></td>
            <td class="action-cell">
              <button class="btn btn-danger btn-icon" @click="deleteFriend(f.id)" title="删除">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </td>
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
  border-radius: 16px;
  padding: 16px 24px;
  box-sizing: border-box;
}

.friend-card {
  width: 100%;
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 16px;
  padding: 0;
  box-sizing: border-box;
  overflow-x: auto;
}

.friend-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}
.friend-table th,
.friend-table td {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  color: rgba(245,245,247,0.60);
  font-size: 13px;
}
.friend-table th {
  background: rgba(255,255,255,0.02);
  font-weight: 600;
  color: rgba(245,245,247,0.35);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.friend-table tr:last-child td {
  border-bottom: none;
}
.friend-table th:last-child,
.friend-table td:last-child {
  text-align: center;
  vertical-align: middle;
}
.action-cell {
  text-align: center;
  vertical-align: middle;
  width: 80px;
}

.table-input {
  width: 95%;
  min-width: 80px;
  background: rgba(255,255,255,0.02);
  color: rgba(245,245,247,0.68);
  border: 1.5px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
  height: 30px;
  transition: all 0.2s;
  box-sizing: border-box;
}
.table-input:focus {
  outline: none;
  border-color: rgba(91,141,239,0.20);
  background: rgba(255,255,255,0.04);
}

/* ========== 输入框 ========== */
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
.input.narrow { width: 140px; }
.input.wide { width: 200px; }

/* ========== 按钮 ========== */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  height: 36px;
}

.btn-primary {
  background: rgba(91,141,239,0.50);
  color: #F5F5F7;
}
.btn-primary:hover {
  background: #5B8DEF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91,141,239,0.20);
}

.btn-danger {
  background: rgba(239,68,68,0.08);
  color: rgba(239,68,68,0.65);
}
.btn-danger:hover {
  background: rgba(239,68,68,0.15);
  color: #ef4444;
  box-shadow: none;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .friend-manage { width: 100%; }
  .friend-add {
    flex-direction: column;
    gap: 6px;
    padding: 14px;
    border-radius: 12px;
  }
  .friend-card { border-radius: 12px; }
  .input { width: 100%; min-width: 0; }
  .btn { width: 100%; }
  .friend-table th,
  .friend-table td { padding: 8px 10px; font-size: 11px; }
}
</style>
