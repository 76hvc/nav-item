<template>
  <div class="ad-manage">
    <div class="ad-header">
      <form class="ad-add-row" @submit.prevent="handleAddAd">
        <input v-model="newAdImg" placeholder="广告图片链接" class="input wide" />
        <input v-model="newAdUrl" placeholder="广告跳转链接" class="input wide" />
        <select v-model="newAdPos" class="input select-input">
          <option value="left">左侧广告</option>
          <option value="right">右侧广告</option>
        </select>
        <button class="btn btn-primary" type="submit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          添加广告
        </button>
      </form>
    </div>
    <div class="ad-section">
      <h3 class="section-title">左侧广告</h3>
      <div class="ad-card">
        <table class="ad-table">
          <thead><tr><th>图片</th><th>跳转链接</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="ad in leftAds" :key="ad.id">
              <td><input v-model="ad.img" @blur="updateAd(ad)" class="table-input" /></td>
              <td><input v-model="ad.url" @blur="updateAd(ad)" class="table-input" /></td>
              <td class="action-cell">
                <button class="btn btn-danger btn-icon" @click="deleteAd(ad.id)" title="删除">
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
    <div class="ad-section">
      <h3 class="section-title">右侧广告</h3>
      <div class="ad-card">
        <table class="ad-table">
          <thead><tr><th>图片</th><th>跳转链接</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="ad in rightAds" :key="ad.id">
              <td><input v-model="ad.img" @blur="updateAd(ad)" class="table-input" /></td>
              <td><input v-model="ad.url" @blur="updateAd(ad)" class="table-input" /></td>
              <td class="action-cell">
                <button class="btn btn-danger btn-icon" @click="deleteAd(ad.id)" title="删除">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAds, addAd as apiAddAd, updateAd as apiUpdateAd, deleteAd as apiDeleteAd } from '../../api';

const leftAds = ref([]);
const rightAds = ref([]);
const newAdImg = ref('');
const newAdUrl = ref('');
const newAdPos = ref('left');

onMounted(loadAds);

async function loadAds() {
  const res = await getAds();
  leftAds.value = res.data.filter(ad => ad.position === 'left');
  rightAds.value = res.data.filter(ad => ad.position === 'right');
}
async function handleAddAd() {
  if (!newAdImg.value || !newAdUrl.value) return;
  await apiAddAd({ position: newAdPos.value, img: newAdImg.value, url: newAdUrl.value });
  newAdImg.value = '';
  newAdUrl.value = '';
  newAdPos.value = 'left';
  loadAds();
}
async function updateAd(ad) {
  await apiUpdateAd(ad.id, { img: ad.img, url: ad.url });
  loadAds();
}
async function deleteAd(id) {
  await apiDeleteAd(id);
  loadAds();
}
</script>

<style scoped>
.ad-manage {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
}
.section-title {
  text-align: left;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 10px;
  color: rgba(245,245,247,0.55);
}
.ad-header {
  margin-bottom: 20px;
}
.ad-section {
  margin-bottom: 24px;
}

.ad-add-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 16px;
  padding: 16px 24px;
  flex-wrap: wrap;
}
.ad-add-row input {
  max-width: 100%;
}

.ad-card {
  width: 100%;
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 16px;
  padding: 0;
  box-sizing: border-box;
  overflow-x: auto;
}

.ad-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}
.ad-table th,
.ad-table td {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  color: rgba(245,245,247,0.60);
  font-size: 13px;
}
.ad-table th {
  background: rgba(255,255,255,0.02);
  font-weight: 600;
  color: rgba(245,245,247,0.35);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.ad-table tr:last-child td {
  border-bottom: none;
}

.action-cell {
  text-align: center;
  vertical-align: middle;
  width: 80px;
}

.table-input {
  width: 95%;
  min-width: 100px;
  background: rgba(255,255,255,0.02);
  color: rgba(245,245,247,0.68);
  border: 1.5px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 13px;
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
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: rgba(91,141,239,0.25);
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 0 2px rgba(91,141,239,0.06);
}
.input::placeholder { color: rgba(245,245,247,0.20); }
.input.wide { width: 260px; }

.select-input {
  min-width: 110px;
}

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
  .ad-manage { width: 100%; }
  .ad-add-row {
    flex-direction: column;
    gap: 6px;
    padding: 14px;
    border-radius: 12px;
  }
  .ad-add-row input { width: 100% !important; }
  .ad-section { width: 100%; }
  .ad-card { border-radius: 12px; }
  .input, .select-input, .btn { width: 100%; }
  .ad-table th, .ad-table td { padding: 8px 10px; font-size: 11px; }
}
</style>
