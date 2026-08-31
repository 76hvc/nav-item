<template>
  <div class="toolbox">
    <div class="tool-card">
      <div class="tool-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <h3 class="tool-title">浏览器快捷添加书签</h3>
      <p class="tool-desc">将下面的按钮拖动到您的浏览器书签栏。在任何网页点击该书签，即可快速将该网页添加到您的导航站。</p>

      <div class="bookmarklet-container">
        <a :href="bookmarkletCode" class="bookmarklet-btn" @click.prevent="alertDrag">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span>拖我到书签栏</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="drag-hint">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </a>
      </div>

      <div class="instructions">
        <h4>使用说明</h4>
        <ol>
          <li>确保您的浏览器显示了<strong>书签栏</strong>（<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>）。</li>
          <li>将上方的蓝色按钮<strong>拖动</strong>到书签栏。</li>
          <li>访问您想收藏的网站，点击书签栏上的这个书签。</li>
          <li>在弹出的窗口中选择分类并提交即可。</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const bookmarkletCode = computed(() => {
  const baseUrl = window.location.origin;
  const quickAddUrl = `${baseUrl}/quick-add`;
  const script = '(function(){' +
    'var icon=document.querySelector(\'link[rel*="icon"]\');' +
    'var query=new URLSearchParams({title:document.title,url:window.location.href,icon:icon?icon.href:""});' +
    `window.open(${JSON.stringify(quickAddUrl)}+"?"+query.toString(),"nav-item-quick-add","width=560,height=720");` +
    '})();';
  return 'javascript:' + encodeURIComponent(script);
});

function alertDrag() {
  alert('请直接将此按钮拖动到您的浏览器书签栏，而不是点击它。');
}
</script>

<style scoped>
.toolbox {
  max-width: 800px;
  width: 95%;
  margin: 0 auto;
  padding: 20px 0;
}

.tool-card {
  background: #1E1E1E;
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 18px;
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.tool-icon {
  width: 44px;
  height: 44px;
  background: rgba(91,141,239,0.10);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5B8DEF;
  margin-bottom: 16px;
}

.tool-title {
  margin: 0 0 8px;
  color: #F5F5F7;
  font-size: 1.2rem;
  font-weight: 600;
}

.tool-desc {
  color: rgba(245,245,247,0.42);
  line-height: 1.7;
  margin: 0 0 28px;
  font-size: 14px;
}

.bookmarklet-container {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.bookmarklet-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(91,141,239,0.55), rgba(91,141,239,0.35));
  color: #F5F5F7;
  padding: 14px 28px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  box-shadow: 0 4px 20px rgba(91,141,239,0.12);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: move;
  position: relative;
  overflow: hidden;
}
.bookmarklet-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #5B8DEF, #7BA4F9);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50px;
}
.bookmarklet-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 28px rgba(91,141,239,0.25);
}
.bookmarklet-btn:hover::before {
  opacity: 1;
}
.bookmarklet-btn span,
.bookmarklet-btn svg {
  position: relative;
  z-index: 1;
}

.drag-hint {
  opacity: 0.5;
  animation: pulse-hint 2s ease-in-out infinite;
}

@keyframes pulse-hint {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 0.8; transform: translateY(2px); }
}

.instructions {
  background: rgba(255,255,255,0.02);
  padding: 20px 24px;
  border-radius: 12px;
  border-left: 3px solid rgba(91,141,239,0.20);
}

.instructions h4 {
  margin: 0 0 12px;
  font-size: 0.95rem;
  color: rgba(245,245,247,0.65);
  font-weight: 500;
}

.instructions ol {
  margin: 0;
  padding-left: 16px;
  color: rgba(245,245,247,0.38);
  line-height: 1.8;
}

.instructions li {
  margin-bottom: 6px;
  font-size: 13px;
}

.instructions li strong {
  color: rgba(245,245,247,0.55);
}

.instructions kbd {
  display: inline-block;
  padding: 2px 6px;
  font-size: 11px;
  font-family: inherit;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  color: rgba(245,245,247,0.60);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .toolbox { width: 100%; }
  .tool-card { padding: 20px; border-radius: 14px; }
  .tool-title { font-size: 1.05rem; }
  .tool-desc { font-size: 13px; }
  .bookmarklet-btn { padding: 12px 20px; font-size: 14px; }
  .instructions { padding: 14px; }
}
</style>
