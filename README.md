# Nav-item - 个人导航站

## 项目简介

一个现代化的导航网站项目，提供简洁美观的导航界面和强大的后台管理系统,快速访问常用网站和工具。

## 🛠️ 技术栈
- Vue 3 + Node.js + SQLite 前后端分离架构

## ✨ 主要功能

### 前端功能
- 🏠 **首页导航**：美观的卡片式导航界面
- 🔍 **聚合搜索**：支持 Google、百度、Bing、GitHub、站内搜索
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🎨 **现代化UI**：采用渐变背景和毛玻璃效果
- 🔗 **友情链接**：支持友情链接展示
- 📢 **广告位**：支持左右两侧广告位展示

### 后台管理功能
- 👤 **用户管理**：管理员登录、用户信息管理
- 📋 **栏目管理**：主菜单和子菜单的增删改查
- 🃏 **卡片管理**：导航卡片的增删改查
- 📢 **广告管理**：广告位的增删改查
- 🔗 **友链管理**：友情链接的增删改查
- 📊 **数据统计**：登录时间、IP等统计信息

### 技术特性
- 🔐 **JWT认证**：安全的用户认证机制
- 🗄️ **SQLite数据库**：轻量级数据库，无需额外配置
- 📤 **文件上传**：支持图片上传功能
- 🔍 **搜索功能**：支持站内搜索和外部搜索
- 📱 **移动端适配**：完美的移动端体验

## 🏗️ 项目结构

```
nav-item/
├── app.js                 # 后端主入口文件
├── config.js             # 配置文件
├── db.js                 # 数据库初始化
├── package.json          # 后端依赖配置
├── database/             # 数据库文件目录
│   └── nav.db           # SQLite数据库文件
├── routes/               # 后端路由
│   ├── auth.js          # 认证相关路由
│   ├── menu.js          # 菜单管理路由
│   ├── card.js          # 卡片管理路由
│   ├── ad.js            # 广告管理路由
│   ├── friend.js        # 友链管理路由
│   ├── user.js          # 用户管理路由
│   └── upload.js        # 文件上传路由
├── uploads/              # 上传文件目录
│   └── default-favicon.png
├── web/                  # 前端项目目录
│    ├── package.json      # 前端依赖配置
│    ├── vite.config.mjs   # Vite配置文件
│    ├── index.html        # HTML入口文件
│    ├── public/           # 静态资源
│    │   ├── background.webp
│    │   ├── default-favicon.png
│    │   └── robots.txt
│    └── src/              # 前端源码
│        ├── main.js       # Vue应用入口
│        ├── router.js     # 路由配置
│        ├── api.js        # API接口封装
│        ├── App.vue       # 根组件
│        ├── components/   # 公共组件
│        │   ├── MenuBar.vue
│        │   └── CardGrid.vue
│        └── views/        # 页面组件
│            ├── Home.vue  # 首页
│            ├── Admin.vue # 后台管理
│            └── admin/    # 后台管理子页面
│                ├── MenuManage.vue
│                ├── CardManage.vue
│               ├── AdManage.vue
│               ├── FriendLinkManage.vue
│               └── UserManage.vue
├── Dockerfile # Docker构建文件
```

## ⚙️ 环境变量及配置说明

### 环境变量
- `PORT`: 服务器端口号（默认: 3000）
- `ADMIN_USERNAME`: 管理员用户名（默认: admin）
- `ADMIN_PASSWORD`: 管理员密码（默认: 123456）

### 数据库配置
系统使用 SQLite 数据库，数据库文件会自动创建在项目/database/目录下，使用docker部署请挂载/app/database目录实现数据持久化
```

## 🚀 部署指南

### 源代码部署

#### 1. 克隆项目
```bash
git clone https://github.com/76hvc/nav-item.git
cd nav-item
```

#### 2. 安装后端依赖
```bash
npm install
```

#### 3. 构建前端
```bash
cd web && npm install && npm run build
```

#### 4. 启动后端服务
```bash
# 在项目根目录
cd .. && npm start
```

#### 6. 访问应用
- 前端地址：http://localhost:3000
- 后台管理：http://localhost:3000/admin
- 默认管理员账号：admin / 123456

### Docker 部署

#### 1：docker快速部署
   ```bash
   docker run -d \
     --name nav-item \
     -p 3000:3000 \
     -v $(pwd)/database:/app/database \
     -v $(pwd)/uploads:/app/uploads \
     -e NODE_ENV=production \
     -e ADMIN_USERNAME=admin \
     -e ADMIN_PASSWORD=123456 \
     eooce/nav-item
   ```
### 2: docker-compose.yaml 部署
```bash
version: '3'

services:
  nav-item:
    image: eooce/nav-item
    container_name: nav-item
    ports:
      - "3000:3000"
    environment:
      - PORT=3000             # 监听端口
      - ADMIN_USERNAME=admin  # 后台用户名
      - ADMIN_PASSWORD=123456 # 后台密码
    volumes:
      - ./database:/app/database  # 持久化数据库
    restart: unless-stopped
```
### 3: docker容器等使用docker image配合环境变量部署
```bash
eooce/nav-item
```
或
```bash
ghcr.io/eooce/nav-item:latest
```

## serv00|ct8|Hostuno 一键安装脚本
- 环境变量,放在脚本前，随脚本一起运行，英文空隔隔开
- 后台管理用户名和密码默认分别为为`admin`和`123456`
  * `DOMAIN`为自定义站点域名

```bash
bash <(curl -Ls https://github.com/eooce/nav-item/releases/download/ct8-and-serv00/install.sh) 
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 Apache-2.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

**eooce** - [GitHub](https://github.com/eooce)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

⭐ 如果这个项目对你有帮助，请给它一个星标！ 







## ☁️ Cloudflare Pages 部署指南 (推荐)

本项目已适配 Cloudflare Pages + Functions + D1，可实现零成本全自动化部署。

### 1. 准备工作
- 一个 Cloudflare 账号
- 在 Cloudflare 控制台创建一个 D1 数据库，命名为 `nav_db`

### 2. 初始化数据库
在 Cloudflare D1 控制台中，执行项目根目录下的 `schema.sql` 文件中的 SQL 语句，以初始化表结构。

### 3. 部署步骤
1. 将本项目 Fork 到你的 GitHub 账号。
2. 在 Cloudflare Pages 控制台点击 "Connect to Git"，选择该仓库。
3. **构建设置**：
   - **Framework preset**: `Vite`
   - **Build command**: `cd web && npm install && npm run build`
   - **Build output directory**: `web/dist`
4. **环境变量**：
   - 在 "Settings" -> "Functions" -> "Variable bindings" 中添加：
     - `JWT_SECRET`: 你的随机字符串（用于登录认证）
   - 在 "Settings" -> "Functions" -> "D1 database bindings" 中添加：
     - **Variable name**: `DB`
     - **D1 database**: 选择你创建的 `nav_db`
5. 点击 "Save and Deploy"。

### 4. 注意事项
- **文件上传**：Cloudflare Pages Functions 不支持本地文件系统，因此原有的本地图标上传功能已禁用。建议在添加卡片时直接使用外部图片链接。
- **默认账号**：由于 D1 数据库初始为空，你需要手动在 D1 中插入一个管理员账号，或在 `schema.sql` 中添加初始数据。
  ```sql
  -- 插入默认管理员 (用户名: admin, 密码: 123456)
  INSERT INTO users (username, password) VALUES ('admin', '$2b$10$o00N7nM4nux5.UzcTQBLOeq9FWFtaaasf4f2/3qGPLb2RpB8yWfZa');
  ```
  *注：由于 bcrypt 盐值随机，建议部署后通过 D1 控制台或 API 注册/初始化。*
