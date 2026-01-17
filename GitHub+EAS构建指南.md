# 🚀 使用 GitHub + EAS 自动构建 APK

本指南教你如何通过 GitHub Actions 自动触发 EAS Build，在云端生成 APK 文件。

## 为什么使用这个方法？

✅ **不需要本地 Android 环境**
- 不需要安装 Android Studio
- 不需要配置 JDK 和 Android SDK
- 避免本地环境问题

✅ **自动化构建**
- 推送代码自动触发构建
- 支持手动触发构建
- 构建历史可追溯

✅ **云端构建**
- 使用 Expo 官方构建服务
- 稳定可靠，无需担心本地环境
- 构建完成后直接下载

---

## 📋 准备工作

### 1. 注册账号

你需要以下免费账号：

- **GitHub 账户**：https://github.com/signup
- **Expo 账户**：https://expo.dev/signup

### 2. 安装必要工具

在本地电脑安装：

- **Git**：https://git-scm.com/downloads
- **Node.js**：https://nodejs.org/（推荐 v18+）

### 3. 验证本地环境

```bash
git --version
node --version
npm --version
```

---

## 🔑 第一步：获取 Expo Token

### 1. 登录 Expo

访问：https://expo.dev

### 2. 生成访问令牌

1. 点击右上角头像
2. 选择 "Account settings"
3. 选择 "Access Tokens"（访问令牌）
4. 点击 "Create new token"
5. 设置：
   - **Name**：GitHub Actions
   - **Expires**：根据需要选择（建议 90 天）
   - **Scopes**：勾选 "Build"
6. 点击 "Create token"
7. **复制保存这个 token**（只显示一次！）

---

## 📦 第二步：创建 GitHub 仓库

### 1. 创建新仓库

1. 访问：https://github.com/new
2. 填写：
   - **Repository name**：`medicine-app`
   - **Description**：药品管理系统
   - **Public** 或 **Private**：根据需要选择
3. 点击 "Create repository"

### 2. 记录仓库 URL

创建后，复制仓库 URL：
- HTTPS：`https://github.com/你的用户名/medicine-app.git`
- 或 SSH：`git@github.com:你的用户名/medicine-app.git

---

## 🔐 第三步：配置 GitHub Secrets

### 1. 进入仓库设置

1. 在 GitHub 仓库页面
2. 点击 "Settings"（设置）
3. 左侧菜单选择 "Secrets and variables" → "Actions"

### 2. 添加 Expo Token

1. 点击 "New repository secret"
2. 填写：
   - **Name**：`EXPO_TOKEN`
   - **Secret**：粘贴第一步复制的 Expo Token
3. 点击 "Add secret"

---

## 📤 第四步：推送项目到 GitHub

### 方法一：使用脚本（推荐）

双击运行：`上传到GitHub并导入Expo.bat`

按照提示：
1. 输入 GitHub 仓库 URL
2. 等待上传完成

### 方法二：使用命令行

```bash
cd D:\medicine-app

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit - 药品管理系统"

# 添加远程仓库（替换为你的 URL）
git remote add origin https://github.com/你的用户名/medicine-app.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

**注意**：首次推送可能需要登录 GitHub。如果提示输入用户名和密码：
- 用户名：GitHub 用户名
- 密码：使用 **Personal Access Token**（不是账户密码）

### 创建 GitHub Personal Access Token（如果需要）

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 设置：
   - **Note**：medicine-app build
   - **Expiration**：90 days
   - **Scopes**：勾选 `repo`
4. 点击 "Generate token"
5. 复制保存这个 token

---

## 🔨 第五步：触发构建

### 自动触发（推荐）

推送代码到 `main` 或 `master` 分支时，GitHub Actions 会自动触发构建：

```bash
# 修改任何文件后
git add .
git commit -m "Update app"
git push
```

构建会自动开始！

### 手动触发

1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Build APK with EAS" 工作流
4. 点击 "Run workflow" 按钮
5. 选择分支（通常选 `main`）
6. 点击 "Run workflow"

---

## 📱 第六步：下载 APK

### 方式一：通过 Expo.dev（推荐）

1. 访问：https://expo.dev
2. 登录你的 Expo 账户
3. 选择项目：`medicine-app`
4. 点击 "Builds" 标签
5. 找到最新的构建记录
6. 点击构建记录
7. 点击 "Download APK" 下载

### 方式二：通过 GitHub Actions

1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择最新的构建记录
4. 滚动到页面底部
5. 点击 "Artifacts" 部分的下载链接

---

## ⚙️ 高级配置

### 修改构建类型

编辑 `.github/workflows/eas-build.yml`：

```yaml
# 构建 Preview APK（测试版）
eas build --platform android --profile preview --non-interactive

# 构建 Production AAB（发布到应用商店）
eas build --platform android --profile production --non-interactive
```

### 修改触发条件

编辑 `.github/workflows/eas-build.yml`：

```yaml
on:
  push:
    branches: [main, develop]  # 添加 develop 分支
  pull_request:
    branches: [main]
  workflow_dispatch:  # 支持手动触发
```

### 定时构建

```yaml
on:
  schedule:
    # 每天 UTC 时间 8:00 构建（北京时间 16:00）
    - cron: '0 8 * * *'
```

---

## ❓ 常见问题

### Q1：构建失败，提示 "EXPO_TOKEN is not set"

**解决**：
1. 检查 GitHub Secrets 中是否正确添加了 `EXPO_TOKEN`
2. Token 是否正确复制
3. Token 是否已过期（在 expo.dev 查看）

### Q2：推送时提示 "Authentication failed"

**解决**：
1. 使用 Personal Access Token 替代密码
2. 或使用 SSH 方式：
   ```bash
   git remote set-url origin git@github.com:你的用户名/medicine-app.git
   ```

### Q3：构建超时或失败

**解决**：
1. 查看 GitHub Actions 日志，找到具体错误
2. 常见问题：
   - `package.json` 中的依赖冲突
   - TypeScript 编译错误
   - Expo SDK 版本不匹配

### Q4：构建成功但找不到下载链接

**解决**：
1. 访问 https://expo.dev 的项目页面
2. 确保使用相同的 Expo 账户登录
3. 检查 app.json 中的 `owner` 字段是否正确

### Q5：如何更新构建配置？

**解决**：
1. 编辑 `eas.json` 文件
2. 提交并推送到 GitHub：
   ```bash
   git add eas.json
   git commit -m "Update build configuration"
   git push
   ```
3. 新构建会使用新配置

### Q6：如何构建生产版本？

**解决**：
1. 确保已配置 Android 签名密钥
2. 在 GitHub Actions 中使用 `production` profile
3. 或手动运行：
   ```bash
   eas build --platform android --profile production
   ```

---

## 📊 构建状态

查看构建进度：

1. **GitHub Actions**：https://github.com/你的用户名/medicine-app/actions
2. **Expo.dev**：https://expo.dev/你的用户名/medicine-app/builds

---

## 🎯 快速命令参考

```bash
# 推送代码触发构建
git push

# 手动触发构建（需要安装 EAS CLI）
eas build --platform android --profile preview

# 查看构建状态
eas build:list

# 查看构建详情
eas build:view [build-id]

# 取消构建
eas build:cancel [build-id]
```

---

## 📚 相关资源

- **EAS Build 文档**：https://docs.expo.dev/build/introduction/
- **GitHub Actions 文档**：https://docs.github.com/en/actions
- **Expo GitHub 集成**：https://docs.expo.dev/build/gh-actions/

---

## 🎉 完成！

现在你可以：
1. ✅ 推送代码到 GitHub
2. ✅ 自动触发云端构建
3. ✅ 下载 APK 文件
4. ✅ 在手机上安装使用

**提示**：
- 首次构建可能需要 10-20 分钟
- 后续构建会更快（有缓存）
- Preview APK 可以直接安装测试
- Production APK 需要签名才能发布

---

## 🆘 需要帮助？

遇到问题？检查：
1. GitHub Actions 日志
2. Expo.dev 构建日志
3. 项目文档：`APK构建指南.md`
4. Expo 官方文档：https://docs.expo.dev/
