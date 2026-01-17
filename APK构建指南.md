# 药品管理系统 - APK 构建指南

## 问题说明

当前环境存在 Android Gradle Plugin 版本兼容性问题，无法直接构建 APK。请使用以下方法之一：

## 方法一：本地开发运行（推荐）

### 步骤 1: 安装依赖
```bash
cd D:\medicine-app
npm install
```

### 步骤 2: 启动开发服务器
```bash
npm start
# 或者
npx expo start
```

### 步骤 3: 在手机上运行
1. 安装 "Expo Go" 应用（从 Google Play 商店）
2. 确保电脑和手机在同一 WiFi 网络
3. 扫描二维码或在 Expo Go 中手动输入地址

## 方法二：云端构建 APK

### 使用 EAS Build（需要 Expo 账号）

1. 安装 EAS CLI：
```bash
npm install -g eas-cli
```

2. 登录 Expo 账号：
```bash
eas login
```

3. 构建 APK：
```bash
cd D:\medicine-app
eas build --platform android --profile preview
```

4. 下载构建好的 APK 文件

### 使用 Expo Snack（在线开发）

1. 访问 https://snack.expo.dev
2. 将项目文件上传到 Snack
3. 在手机上使用 Expo Go 扫描二维码

## 方法三：手动构建 APK

### 环境要求
- Android Studio
- JDK 17
- Android SDK

### 构建步骤

1. 预编译项目：
```bash
cd D:\medicine-app
npx expo prebuild --platform android
```

2. 打开 Android Studio：
```bash
cd D:\medicine-app\android
open android/
```

3. 在 Android Studio 中：
   - 点击 Build > Generate Signed Bundle/APK
   - 选择 APK
   - 配置签名密钥（或者使用调试密钥）
   - 选择 debug 或 release 版本
   - 点击 Finish

## 已实现功能

✅ 药品管理
   - 药品列表（搜索、筛选）
   - 添加/编辑/删除药品
   - 库存管理
   - 低库存预警

✅ 仓库管理
   - 仓库列表
   - 添加/编辑/删除仓库
   - 库存统计

✅ 客户管理
   - 客户列表
   - 添加/编辑/删除客户
   - 客户类型分类

✅ 交易记录
   - 入库/出库/退货/调整
   - 交易历史查询
   - 金额统计

✅ 统计报表
   - 今日概览
   - 核心指标
   - 销售数据
   - 预警信息

## 项目结构

```
medicine-app/
├── app/
│   ├── tabs/          # 底部导航
│   ├── medicine/      # 药品管理页面
│   ├── warehouse/     # 仓库管理页面
│   ├── client/        # 客户管理页面
│   ├── transactions/  # 交易记录页面
│   └── statistics/    # 统计报表页面
├── components/        # 通用组件
├── database/          # 数据库模块
├── types/             # 类型定义
└── utils/             # 工具函数
```

## 技术栈

- React Native 0.81.5
- Expo SDK 54
- TypeScript
- SQLite（本地存储）
- React Navigation（导航）

## 常见问题

### Q: 构建失败怎么办？
A: 尝试清理缓存后重新构建：
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --platform android
```

### Q: 无法连接到开发服务器？
A: 确保手机和电脑在同一 WiFi 网络，检查防火墙设置。

### Q: 数据库初始化失败？
A: 重启应用，检查应用权限设置。

## 联系方式

如有问题，请检查：
1. Node.js 版本（推荐 v18+）
2. npm 版本（推荐 v9+）
3. Android Studio 是否正确配置
4. Android SDK 是否安装
