@echo off
chcp 65001 >nul
echo ========================================
echo    上传项目到 GitHub 并导入到 Expo
echo ========================================
echo.
echo 这个脚本会帮你：
echo 1. 初始化 Git 仓库
echo 2. 推送到 GitHub
echo 3. 在 Expo.dev 导入项目
echo.
echo ⚠ 需要准备：
echo - GitHub 账户（免费注册：https://github.com/signup）
echo - 在 GitHub 上创建一个空仓库
echo.
echo ========================================
echo 第 1/3 步：初始化 Git 仓库
echo ========================================
echo.

cd /d "%~dp0"

call git init
if %errorlevel% neq 0 (
    echo     ✗ Git 未安装
    echo     请先安装 Git: https://git-scm.com/download/win
    echo     或者直接手动上传到 Expo.dev
    echo.
    pause
    exit /b 1
)
echo     ✓ Git 仓库初始化成功

echo.
echo 正在添加文件到 Git...
call git add .
echo     ✓ 文件已添加

echo.
echo 正在提交...
call git commit -m "Initial commit - 药品管理系统"
if %errorlevel% neq 0 (
    echo     ⚠ 提交失败，可能没有文件可提交
    echo     继续下一步...
) else (
    echo     ✓ 提交成功
)

echo.
echo ========================================
echo 第 2/3 步：连接到 GitHub
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
call git remote add origin %REPO_URL%
if %errorlevel% neq 0 (
    echo     ✗ 连接失败，请检查 URL 是否正确
    echo.
    pause
    exit /b 1
)
echo     ✓ 已连接到 GitHub

echo.
echo 正在推送到 GitHub...
call git branch -M main
call git push -u origin main
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
    echo 1. 重新运行本脚本
    echo 2. 手动在浏览器中输入 GitHub 用户名和密码
    echo 3. 或者手动上传到 Expo.dev（推荐）
    echo.
    echo ========================================
    echo 手动上传到 Expo.dev：
    echo ========================================
    echo.
    echo 1. 访问：https://expo.dev
    echo 2. 登录或注册
    echo 3. 点击 "New project"
    echo 4. 选择 "Upload a project"
    echo 5. 选择文件夹：D:\medicine-app
    echo 6. 点击 "Create project"
    echo.
) else (
    echo     ✓ 推送成功！

    echo.
    echo ========================================
    echo 第 3/3 步：在 Expo.dev 导入
    echo ========================================
    echo.
    echo 接下来：
    echo 1. 访问：https://expo.dev
    echo 2. 点击 "New project"
    echo 3. 选择 "Import from GitHub"
    echo 4. 选择 medicine-app 仓库
    echo 5. 点击 "Import project"
    echo.
    echo ========================================
    echo    ✓ 所有步骤完成！
    echo ========================================
    echo.
    echo 导入完成后，在 Expo.dev 点击 "Builds"
    echo 然后点击 "New build" 开始构建 APK！
)

pause
