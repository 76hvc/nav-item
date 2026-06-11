<template>
  <div class="toolbox">
    <div class="tool-card">
      <h3 class="tool-title">浏览器快捷添加书签</h3>
      <p class="tool-desc">将下面的按钮拖动到您的浏览器书签栏。在任何网页点击该书签，即可快速将该网页添加到您的导航站。</p>
      
      <div class="bookmarklet-container">
        <a :href="bookmarkletCode" class="bookmarklet-btn" @click.prevent="alertDrag">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          拖我到书签栏
        </a>
      </div>

      <div class="instructions">
        <h4>使用说明：</h4>
        <ol>
          <li>确保您的浏览器显示了<strong>书签栏</strong>（Ctrl+Shift+B）。</li>
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
  // 使用普通字符串拼接，避免在 Vue 模板中使用反引号导致解析错误
  const script = '(function(){' +
    'var t=document.title,u=window.location.href,i=(document.querySelector(\'link[rel*="icon"]\')||{href:window.location.origin+"/favicon.ico"}).href;' +
    'var c=document.createElement("div");c.id="ni-qa";c.style.cssText="position:fixed;top:20px;right:20px;width:320px;background:#fff;box-shadow:0 10px 25px rgba(0,0,0,0.2);border-radius:12px;z-index:999999;padding:20px;font-family:sans-serif;border:1px solid #eee;color:#333;";' +
    'c.innerHTML=\'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;"><h3 style="margin:0;font-size:18px;">添加到导航站</h3><span id="ni-c" style="cursor:pointer;font-size:20px;color:#999;">&times;</span></div>' +
    '<div style="margin-bottom:12px;"><label style="display:block;font-size:12px;color:#666;margin-bottom:4px;">标题</label><input id="ni-t" type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;"></div>' +
    '<div style="margin-bottom:12px;"><label style="display:block;font-size:12px;color:#666;margin-bottom:4px;">分类</label><select id="ni-m" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;"><option>加载中...</option></select></div>' +
    '<button id="ni-s" style="width:100%;padding:10px;background:#2566d8;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">立即提交</button><div id="ni-msg" style="margin-top:10px;font-size:12px;text-align:center;display:none;"></div>\';' +
    'document.body.appendChild(c);' +
    'document.getElementById("ni-t").value=t;' +
    'var close=function(){document.body.removeChild(c)};document.getElementById("ni-c").onclick=close;' +
    'fetch("' + baseUrl + '/api/quick-add/menus").then(function(r){return r.json()}).then(function(d){' +
      'var s=document.getElementById("ni-m");s.innerHTML="";' +
      'd.forEach(function(m){' +
        'var o=document.createElement("option");o.value=m.id;o.textContent=m.name;s.appendChild(o);' +
        'm.subMenus.forEach(function(sm){var so=document.createElement("option");so.value=m.id+":"+sm.id;so.textContent="  └ "+sm.name;s.appendChild(so);});' +
      '});' +
    '});' +
    'document.getElementById("ni-s").onclick=function(){' +
      'var b=this,m=document.getElementById("ni-msg"),v=document.getElementById("ni-m").value,p=v.split(":"),tk=localStorage.getItem("token");' +
      'if(!tk){m.style.display="block";m.style.color="red";m.textContent="❌ 请先登录导航站后台";return;}' +
      'b.disabled=true;b.textContent="提交中...";' +
      'fetch("' + baseUrl + '/api/cards",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+tk},' +
      'body:JSON.stringify({menu_id:Number(p[0]),sub_menu_id:p[1]?Number(p[1]):null,title:document.getElementById("ni-t").value,url:u,logo_url:i,desc:"",order:0})' +
      '}).then(function(r){if(r.status===401)throw new Error("登录已过期");if(!r.ok)throw new Error("提交失败");return r.json();})' +
      '.then(function(){m.style.display="block";m.style.color="green";m.textContent="✅ 添加成功！";setTimeout(close,1500);})' +
      '.catch(function(e){b.disabled=false;b.textContent="立即提交";m.style.display="block";m.style.color="red";m.textContent="❌ "+e.message;});' +
    '};' +
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
  border-radius: 16px;
  padding: 28px;
}

.tool-title {
  margin-top: 0;
  margin-bottom: 8px;
  color: #F5F5F7;
  font-size: 1.2rem;
  font-weight: 600;
}

.tool-desc {
  color: rgba(245,245,247,0.45);
  line-height: 1.7;
  margin-bottom: 24px;
  font-size: 14px;
}

.bookmarklet-container {
  display: flex;
  justify-content: center;
  margin: 28px 0;
}

.bookmarklet-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(91,141,239,0.55);
  color: #F5F5F7;
  padding: 12px 24px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(91,141,239,0.15);
  transition: all 0.3s ease;
  cursor: move;
}
.bookmarklet-btn:hover {
  background: #5B8DEF;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(91,141,239,0.25);
}

.instructions {
  background: rgba(255,255,255,0.02);
  padding: 20px 24px;
  border-radius: 12px;
  border-left: 3px solid rgba(91,141,239,0.25);
}

.instructions h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 0.95rem;
  color: rgba(245,245,247,0.70);
}

.instructions ol {
  margin: 0;
  padding-left: 16px;
  color: rgba(245,245,247,0.40);
  line-height: 1.8;
}

.instructions li {
  margin-bottom: 6px;
  font-size: 13px;
}

.instructions li strong {
  color: rgba(245,245,247,0.60);
}

@media (max-width: 768px) {
  .toolbox { width: 100%; }
  .tool-card { padding: 18px; border-radius: 12px; }
  .tool-title { font-size: 1.05rem; }
  .tool-desc { font-size: 13px; }
  .bookmarklet-btn { padding: 10px 18px; font-size: 13px; }
  .instructions { padding: 14px; }
}
</style>
