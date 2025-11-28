# NewsNow 部署和启动指南

## 概述

NewsNow 是一个全栈新闻聚合应用，支持多种部署方式。本指南将详细介绍如何在后台启动服务并配置端口访问。

## 🚀 快速开始

### 最简单的 Docker 部署

```bash
# 1. 克隆项目
git clone git@github.com:Luojz/newsnow.git
cd newsnow

# 2. 配置环境变量
cp example.env.server .env.server
# 编辑 .env.server 添加你的 GitHub OAuth 配置

# 3. 启动服务
docker-compose up -d

# 4. 访问应用
# 浏览器打开: http://localhost:4444
```

## 📋 环境要求

### 系统要求
- **操作系统**: Linux/macOS/Windows
- **Node.js**: >= 20.0.0
- **内存**: 最低 512MB，推荐 1GB+
- **存储**: 最低 1GB 可用空间

### 必需的配置

在开始部署前，你需要准备：

1. **GitHub OAuth App** (用于用户登录)
   - 访问 [GitHub Developer Settings](https://github.com/settings/applications/new)
   - 创建新的 OAuth App
   - 获取 `Client ID` 和 `Client Secret`

2. **环境变量配置**
   ```env
   G_CLIENT_ID=your_github_client_id
   G_CLIENT_SECRET=your_github_client_secret
   JWT_SECRET=your_jwt_secret_recommend_32_chars
   INIT_TABLE=true
   ENABLE_CACHE=true
   ```

## 🔧 部署方案

### 方案 1: Docker 部署 (推荐)

#### 1.1 使用 Docker Compose

```yaml
# docker-compose.yml (项目已包含)
services:
  newsnow:
    image: ghcr.io/ourongxing/newsnow:latest
    container_name: newsnow
    ports:
      - '4444:4444' # 外部端口:内部端口
    volumes:
      - newsnow_data:/usr/app/.data # 数据持久化
    environment:
      - HOST=0.0.0.0
      - PORT=4444
      - NODE_ENV=production
      - G_CLIENT_ID=${G_CLIENT_ID}
      - G_CLIENT_SECRET=${G_CLIENT_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - INIT_TABLE=true
      - ENABLE_CACHE=true
      - PRODUCTHUNT_API_TOKEN=${PRODUCTHUNT_API_TOKEN}

volumes:
  newsnow_data:
    name: newsnow_data
```

**启动命令:**
```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f newsnow

# 停止服务
docker-compose down

# 重启服务
docker-compose restart newsnow
```

#### 1.2 自定义端口

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - '3000:4444' # 将外部端口改为 3000
  # 或其他端口: '8080:4444'
```

#### 1.3 构建自己的镜像

```bash
# 构建镜像
docker build -t luojz/newsnow .

# 运行容器
docker run -d \
  --name newsnow \
  -p 3000:4444 \
  -e G_CLIENT_ID=your_client_id \
  -e G_CLIENT_SECRET=your_client_secret \
  -e JWT_SECRET=your_jwt_secret \
  -v newsnow_data:/usr/app/.data \
  luojz/newsnow
```

### 方案 2: Node.js 直接部署

#### 2.1 本地构建和运行

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 配置环境变量
cp example.env.server .env.server
# 编辑 .env.server

# 4. 启动服务
npm start
```

#### 2.2 使用 PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
PORT=3000 pm2 start "npm start" --name newsnow

# 查看状态
pm2 status

# 查看日志
pm2 logs newsnow

# 重启服务
pm2 restart newsnow

# 停止服务
pm2 stop newsnow

# 删除进程
pm2 delete newsnow

# 保存 PM2 配置
pm2 save
pm2 startup
```

#### 2.3 PM2 配置文件

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: "newsnow",
    script: "npm",
    args: "start",
    cwd: "./",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time: true
  }]
}
```

**使用配置文件启动:**
```bash
pm2 start ecosystem.config.js
```

### 方案 3: 开发模式部署

```bash
# 开发模式启动 (热重载)
npm run dev

# 指定端口开发模式
PORT=3000 npm run dev

# 后台运行开发模式
nohup PORT=3000 npm run dev > dev.log 2>&1 &
```

## 🌐 网络配置

### 端口说明

| 端口 | 用途 | 说明 |
|------|------|------|
| 4444 | 默认端口 | Docker 容器内部端口 |
| 3000 | 常用 Web 端口 | 可自定义的外部端口 |
| 8080 | 备用端口 | 另一个常用 Web 端口 |

### 防火墙配置

```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw allow 4444

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=4444/tcp
sudo firewall-cmd --reload
```

## 🔄 Nginx 反向代理 (可选)

### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 配置文件

创建 `/etc/nginx/sites-available/newsnow`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 重定向到 HTTPS (可选)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:4444;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓存设置 (可选)
        proxy_cache_bypass $http_upgrade;
        proxy_no_cache $http_upgrade;
    }

    # 静态文件缓存 (可选)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:4444;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# HTTPS 配置 (可选)
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:4444;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**启用站点:**
```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/newsnow /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 📊 监控和日志

### Docker 日志监控

```bash
# 实时查看日志
docker-compose logs -f newsnow

# 查看最近 100 行日志
docker-compose logs --tail=100 newsnow

# 查看容器资源使用
docker stats newsnow
```

### PM2 监控

```bash
# PM2 监控面板
pm2 monit

# 查看详细信息
pm2 show newsnow

# 日志轮转配置
pm2 install pm2-logrotate
```

### 系统服务配置 (可选)

创建 systemd 服务文件 `/etc/systemd/system/newsnow.service`:

```ini
[Unit]
Description=NewsNow News Aggregator
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/newsnow
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=newsnow

[Install]
WantedBy=multi-user.target
```

**启用服务:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable newsnow
sudo systemctl start newsnow
sudo systemctl status newsnow
```

## 🔒 安全配置

### 环境变量安全

```bash
# 设置文件权限
chmod 600 .env.server

# 确保 .env.server 不被提交到 Git
echo ".env.server" >> .gitignore
```

### SSL/TLS 配置

```bash
# 使用 Let's Encrypt (推荐)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 防火墙建议

```bash
# 只开放必要端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 🚨 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 查看端口占用
lsof -i :4444
netstat -tulpn | grep :4444

# 杀死占用进程
sudo kill -9 <PID>
```

#### 2. Docker 容器无法启动
```bash
# 查看容器日志
docker-compose logs newsnow

# 检查容器状态
docker-compose ps

# 重新构建
docker-compose up --build -d
```

#### 3. 数据库连接失败
```bash
# 检查环境变量
docker-compose exec newsnow env | grep -E "(DB_|DATABASE)"

# 检查数据卷
docker volume ls | grep newsnow
```

#### 4. 内存不足
```bash
# 检查内存使用
free -h
docker stats

# 增加 swap 空间 (Linux)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 日志分析

```bash
# 应用错误日志
tail -f logs/err.log

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -u newsnow -f
```

## 📈 性能优化

### Node.js 优化

```javascript
// 在 .env.server 中添加
NODE_OPTIONS = "--max-old-space-size=1024"
UV_THREADPOOL_SIZE = 128
```

### Nginx 优化

```nginx
# 在 nginx.conf 中添加
worker_processes auto;
worker_connections 1024;

# 在站点配置中添加
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## 🔄 更新和维护

### Docker 更新

```bash
# 拉取最新镜像
docker-compose pull

# 重新部署
docker-compose up -d --force-recreate

# 清理旧镜像
docker image prune -f
```

### Node.js 更新

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
npm install

# 重新构建
npm run build

# 重启服务 (PM2)
pm2 restart newsnow
```

### 备份数据

```bash
# 备份数据库
docker run --rm -v newsnow_data:/data -v $(pwd):/backup alpine tar czf /backup/newsnow-data-backup.tar.gz -C /data .

# 备份配置文件
cp .env.server .env.server.backup
```

## 📚 参考链接

- [GitHub OAuth 文档](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [PM2 文档](https://pm2.keymetrics.io/docs/)
- [Nginx 文档](https://nginx.org/en/docs/)

## 💬 技术支持

如遇到问题，请访问：
- GitHub Issues: https://github.com/Luojz/newsnow/issues
- 项目文档: https://github.com/Luojz/newsnow
- API 文档: [API.md](./API.md)

---

**最后更新**: 2024年12月
**版本**: v1.0
