@echo off
chcp 65001 >nul
echo ========================================
echo    GitHub + EAS 快速配置向导
echo ========================================
echo.
echo 这个脚本会帮助你：
echo 1. 检查本地环境
echo 2. 初始化 Git 仓库
echo 3. 推送项目到 GitHub
echo 4. 提供后续步骤指导
echo.
echo ⚠ 准备工作：
echo 1. 已注册 GitHub 账户（https://github.com/signup）
echo 2. 已注册 Expo 账户（https://expo.dev/signup）
echo 3. 在 GitHub 创建了新仓库
echo.
echo ========================================
echo 第 1/4 步：检查本地环境
echo ========================================
echo.

cd /d "%~dp0"

REM 检查 Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo     ✗ Git 未安装
    echo.
    echo 请先安装 Git: https://git-scm.com/download/win
    echo 安装完成后重新运行本脚本。
    echo.
    pause
    exit /b 1
)
echo     ✓ Git 已安装

REM 检查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo     ✗ Node.js 未安装
    echo.
    echo 请先安装 Node.js: https://nodejs.org/
    echo 安装完成后重新运行本脚本。
    echo.
    pause
    exit /b 1
)
echo     ✓ Node.js 已安装

REM 检查 npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo     ✗ npm 不可用
    echo.
    pause
    exit /b 1
)
echo     ✓ npm 已安装

REM 检查 Git 仓库状态
git rev-parse --is-inside-work-tree >nul 2>&1
if %errorlevel% neq 0 (
    echo     ✗ 当前不是 Git 仓库
) else (
    echo     ✓ 已是 Git 仓库
)

echo.
echo ========================================
echo 第 2/4 步：配置 Git
echo ========================================
echo.

REM 设置 Git 用户信息
set GIT_NAME=
set GIT_EMAIL=

if "%GIT_NAME%"=="" (
    echo 请输入你的 Git 用户名（留空使用默认）：
    set /p GIT_NAME=
)

if "%GIT_EMAIL%"=="" (
    echo 请输入你的 Git 邮箱（留空使用默认）：
    set /p GIT_EMAIL=
)

if not "%GIT_NAME%"=="" (
    git config user.name "%GIT_NAME%"
    echo     ✓ Git 用户名已设置：%GIT_NAME%
)

if not "%GIT_EMAIL%"=="" (
    git config user.email "%GIT_EMAIL%"
    echo     ✓ Git 邮箱已设置：%GIT_EMAIL%
)

echo.
echo ========================================
echo 第 3/4 步：初始化 Git 仓库
echo ========================================
echo.

REM 初始化仓库
git rev-parse --is-inside-work-tree >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在初始化 Git 仓库...
    git init
    echo     ✓ Git 仓库初始化成功
) else (
    echo     ✓ Git 仓库已存在
)

REM 添加文件
echo.
echo 正在添加文件到 Git...
git add .

REM 检查是否有改动
git diff-index --quiet HEAD --
if %errorlevel% equ 0 (
    echo     ⚠ 没有新的改动需要提交
) else (
    echo 正在提交...
    git commit -m "Initial commit - 药品管理系统"
    echo     ✓ 提交成功
)

echo.
echo ========================================
echo 第 4/4 步：连接 GitHub
echo ========================================
echo.
echo 请先在 GitHub 上创建一个新仓库：
echo.
echo 操作步骤：
echo 1. 访问：https://github.com/new
echo 2. 仓库名称：medicine-app
echo 3. 选择 "Public" 或 "Private"
echo 4. 点击 "Create repository"
echo 5. 复制仓库的 URL
echo    例如：https://github.com/你的用户名/medicine-app.git
echo.
echo ========================================
pause

echo.
echo 请输入 GitHub 仓库 URL:
set /p REPO_URL=

if "%REPO_URL%"=="" (
    echo.
    echo ✗ URL 不能为空
    echo.
    pause
    exit /b 1
)

echo.
echo 正在连接到 GitHub...

REM 检查是否已有远程仓库
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo 检测到已有远程仓库
    set /p CONFIRM_REPLACE=是否替换？(Y/N):
    if /i "%CONFIRM_REPLACE%"=="Y" (
        git remote remove origin
        git remote add origin %REPO_URL%
        echo     ✓ 远程仓库已更新
    ) else (
        echo     保留原有远程仓库配置
    )
) else (
    git remote add origin %REPO_URL%
    echo     ✓ 已连接到 GitHub
)

echo.
echo 正在推送到 GitHub...
git branch -M main
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo    ✗ 推送失败！
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 需要身份验证
    echo 2. 网络问题
    echo 3. 仓库 URL 错误
    echo.
    echo 解决方法：
    echo 1. 如果需要身份验证，请使用 Personal Access Token
    echo    生成地址：https://github.com/settings/tokens
    echo.
    echo 2. 或者使用 SSH 方式：
    echo    将仓库 URL 改为：git@github.com:你的用户名/medicine-app.git
    echo.
    echo 3. 检查仓库 URL 是否正确：%REPO_URL%
    echo.
    pause
    exit /b 1
)

echo     ✓ 推送成功！

echo.
echo ========================================
echo    🎉 配置完成！
echo ========================================
echo.
echo 接下来的步骤：
echo.
echo 第 1 步：获取 Expo Token
echo 1. 访问：https://expo.dev
echo 2. 登录你的账户
echo 3. 进入 Account settings
echo 4. 选择 "Access Tokens"
echo 5. 创建新 Token（勾选 Build 权限）
echo 6. 复制保存这个 Token
echo.
echo 第 2 步：配置 GitHub Secrets
echo 1. 访问：https://github.com/你的用户名/medicine-app/settings/secrets/actions
echo 2. 点击 "New repository secret"
echo 3. Name: EXPO_TOKEN
echo 4. Secret: 粘贴 Expo Token
echo 5. 点击 "Add secret"
echo.
echo 第 3 步：触发构建
echo 推送代码到 GitHub 后，构建会自动开始！
echo 或者手动触发：
echo 1. 访问：https://github.com/你的用户名/medicine-app/actions
echo 2. 点击 "Build APK with EAS"
echo 3. 点击 "Run workflow"
echo.
echo 第 4 步：下载 APK
echo 1. 访问：https://expo.dev
echo 2. 选择项目：medicine-app
echo 3. 点击 "Builds"
echo 4. 点击最新的构建记录
echo 5. 点击 "Download APK"
echo.
echo 📚 详细指南：打开 "GitHub+EAS构建指南.md"
echo.
echo ========================================
pause
