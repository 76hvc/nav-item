<template>
  <div class="container card-grid" :class="animationClass">
    <div v-for="(card, index) in cards" :key="card.id"
         class="link-item"
         :data-card-id="card.id"
         :style="getCardStyle(index)">
      <a :href="card.url" target="_blank" rel="noopener noreferrer" :title="getTooltip(card)" :aria-label="`打开 ${card.title}`">
        <img class="link-icon" :src="getLogo(card)" :alt="`${card.title} 图标`" @error="onImgError" loading="lazy">
        <span class="link-text">{{ truncate(card.title) }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({ cards: { type: Array, default: () => [] } });

// 动画状态
const animationClass = ref('');
const animationType = ref('slideUp'); // 'slideUp' 或 'radial'

// 监听 cards 变化，触发动画
watch(() => props.cards, (newCards, oldCards) => {
  // 如果是新的卡片数据或者从有数据变成其他数据
  if (newCards && newCards.length > 0) {
    // 如果是首次加载或者数据发生了变化
    const isDataChanged = !oldCards || oldCards.length === 0 || JSON.stringify(newCards) !== JSON.stringify(oldCards);
    if (isDataChanged) {
      // 延迟一下确保DOM更新完成
      nextTick(() => {
        triggerAnimation();
      });
    }
  }
}, { deep: true, immediate: false });

// 触发动画
function triggerAnimation() {
  // 随机选择动画类型，替换bounceIn为convergeIn
  const animations = ['slideUp', 'radial', 'fadeIn', 'slideLeft', 'slideRight', 'convergeIn', 'flipIn'];
  const randomIndex = Math.floor(Math.random() * animations.length);
  animationType.value = animations[randomIndex];
  animationClass.value = `animate-${animationType.value}`;

  // 动画结束后清除类名
  setTimeout(() => {
    animationClass.value = '';
  }, 1200);
}

// 获取卡片样式（用于延迟动画）
function getCardStyle(index) {
  if (!animationClass.value) return {};

  // 在移动设备上不使用延迟动画
  const isMobile = window.innerWidth <= 480;
  if (isMobile) {
    return {
      animationDelay: '0s'
    };
  }

  if (animationType.value === 'slideUp') {
    // 从下往上：按索引顺序延迟
    return {
      animationDelay: `${index * 0.05}s`
    };
  } else if (animationType.value === 'radial') {
    // 从中心扩散：根据距离中心的位置计算延迟
    const cols = window.innerWidth <= 768 ? 3 : (window.innerWidth <= 1200 ? 4 : 6);
    const row = Math.floor(index / cols);
    const col = index % cols;
    const centerCol = Math.floor(cols / 2);
    const distance = Math.abs(col - centerCol) + row;
    return {
      animationDelay: `${distance * 0.08}s`
    };
  } else if (animationType.value === 'fadeIn') {
    // 淡入动画：随机延迟
    return {
      animationDelay: `${Math.random() * 0.5}s`
    };
  } else if (animationType.value === 'slideLeft') {
    // 从左往右：按行延迟
    const cols = window.innerWidth <= 768 ? 3 : (window.innerWidth <= 1200 ? 4 : 6);
    const row = Math.floor(index / cols);
    return {
      animationDelay: `${row * 0.1}s`
    };
  } else if (animationType.value === 'slideRight') {
    // 从右往左：按行延迟（反向）
    const cols = window.innerWidth <= 768 ? 3 : (window.innerWidth <= 1200 ? 4 : 6);
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      animationDelay: `${(row + (cols - col - 1) * 0.02) * 0.08}s`
    };
  } else if (animationType.value === 'convergeIn') {
    // 从两边往中间靠拢：根据列的位置计算延迟
    const cols = window.innerWidth <= 768 ? 3 : (window.innerWidth <= 1200 ? 4 : 6);
    const col = index % cols;
    const centerCol = Math.floor(cols / 2);
    const distanceFromCenter = Math.abs(col - centerCol);
    // 边缘的元素先出现，中间的最后出现
    return {
      animationDelay: `${(cols - distanceFromCenter - 1) * 0.08}s`
    };
  } else if (animationType.value === 'flipIn') {
    // 翻转入场：按对角线延迟
    const cols = window.innerWidth <= 768 ? 3 : (window.innerWidth <= 1200 ? 4 : 6);
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      animationDelay: `${(row + col) * 0.06}s`
    };
  }

  return {};
}

function getLogo(card) {
  if (card.custom_logo_path) return '/uploads/' + card.custom_logo_path;
  if (card.display_logo) return card.display_logo;
  if (card.logo_url) return card.logo_url;
  // 默认 favicon
  try {
    const url = new URL(card.url);
    return url.origin + '/favicon.ico';
  } catch {
    return '/default-favicon.png';
  }
}

function onImgError(event) {
  if (!event.target.src.endsWith('/default-favicon.png')) {
    event.target.src = '/default-favicon.png';
  }
}

function getTooltip(card) {
  let tip = '';
  if (card.desc) tip += card.desc + '\n';
  tip += card.url;
  return tip;
}

function truncate(str) {
  if (!str) return '';
  return str.length > 20 ? str.slice(0, 20) + '...' : str;
}
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 76rem;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
  margin: 0 auto;
  padding: 0 1rem;
}

.link-item {
  min-width: 0;
  min-height: 112px;
  aspect-ratio: 1.42 / 1;
  overflow: hidden;
  position: relative;
  display: grid;
  place-items: center;
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  background: var(--bg-raised);
  box-shadow: 0 7px 22px rgba(0,0,0,0.17);
  transition:
    transform 220ms var(--ease-out),
    border-color 220ms ease,
    background 220ms ease,
    box-shadow 220ms ease;
}

.link-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(145deg, rgba(111,145,232,0.075), transparent 46%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease;
}

.link-item:hover {
  z-index: 1;
  transform: translateY(-4px);
  border-color: rgba(111,145,232,0.24);
  background: var(--bg-overlay);
  box-shadow: 0 16px 38px rgba(0,0,0,0.34);
}

.link-item:hover::before { opacity: 1; }

.link-item a {
  width: 100%;
  height: 100%;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 11px;
  padding: 14px 10px;
  position: relative;
  z-index: 1;
  color: var(--text-primary);
  text-decoration: none;
}

.link-item a:focus-visible {
  outline-offset: -4px;
  border-radius: 14px;
}

.link-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 8px;
  filter: saturate(0.94);
  transition: transform 220ms var(--ease-spring), filter 220ms ease;
}

.link-item:hover .link-icon {
  transform: scale(1.1);
  filter: saturate(1.08);
}

.link-text {
  max-width: 100%;
  min-height: 1.3em;
  overflow: hidden;
  display: -webkit-box;
  padding: 0 3px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
  text-overflow: ellipsis;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  transition: color 180ms ease;
}

.link-item:hover .link-text { color: var(--text-primary); }

.animate-slideUp .link-item,
.animate-radial .link-item,
.animate-fadeIn .link-item,
.animate-slideLeft .link-item,
.animate-slideRight .link-item,
.animate-convergeIn .link-item,
.animate-flipIn .link-item {
  opacity: 0;
  animation: card-enter 460ms var(--ease-out) forwards;
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(12px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 1100px) {
  .container { max-width: 52rem; grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 720px) {
  .container {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    padding: 0 0.75rem;
  }
  .link-item { min-height: 92px; border-radius: 13px; }
  .link-item a { gap: 8px; padding: 10px 6px; }
  .link-icon { width: 28px; height: 28px; }
  .link-text { font-size: 12px; }
}

@media (max-width: 380px) {
  .container { gap: 8px; padding-inline: 0.6rem; }
  .link-item { min-height: 86px; }
  .link-icon { width: 25px; height: 25px; }
  .link-text { font-size: 11px; }
}

@media (prefers-reduced-motion: reduce) {
  .animate-slideUp .link-item,
  .animate-radial .link-item,
  .animate-fadeIn .link-item,
  .animate-slideLeft .link-item,
  .animate-slideRight .link-item,
  .animate-convergeIn .link-item,
  .animate-flipIn .link-item {
    opacity: 1;
    animation: none;
    transform: none;
  }
}
</style>
