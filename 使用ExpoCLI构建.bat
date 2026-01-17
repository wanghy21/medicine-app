@echo off
chcp 65001 >nul
echo ========================================
echo    使用 Expo CLI 构建（简化版）
echo ========================================
echo.
echo 这个方法会自动下载 Expo CLI
echo 并使用它来构建项目，绕过 npm 问题。
echo.
echo ========================================
echo    开始构建...
echo ========================================
echo.

call npx expo-cli@latest build:android

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    ✓ 构建请求已提交！
    echo ========================================
    echo.
    echo 接下来：
    echo 1. 等待 10-20 分钟
    echo 2. 会显示构建进度
    echo 3. 完成后提供下载链接
    echo.
) else (
    echo.
    echo ========================================
    echo    ✗ 构建失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. Node.js 未安装
    echo 2. 网络问题
    echo 3. 项目配置问题
    echo.
    echo 解决方法：
    echo 1. 运行"检查npm环境.bat"
    echo 2. 安装 Node.js: https://nodejs.org/
    echo.
)

pause
