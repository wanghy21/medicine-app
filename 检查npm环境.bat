@echo off
chcp 65001 >nul
echo ========================================
echo    清理 npm 缓存并重新初始化
echo ========================================
echo.
echo 正在清理 npm 缓存...

call npm cache clean --force

if %errorlevel% equ 0 (
    echo     ✓ npm 缓存清理成功
) else (
    echo     ✗ npm 缓存清理失败
    echo.
    echo 可能的原因：
    echo 1. npm 没有正确安装
    echo 2. Node.js 没有正确安装
    echo.
    goto :check_node
)

echo.
echo ========================================
echo    检查 Node.js 和 npm
echo ========================================
echo.

:check_node
echo 检查 Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo     ✗ Node.js 未安装或不在 PATH 中
    echo.
    echo 解决方法：
    echo 1. 下载安装 Node.js: https://nodejs.org/
    echo 2. 下载 LTS 版本（推荐）
    echo 3. 双击安装
    echo 4. 重启 PowerShell
    echo.
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo     ✓ Node.js 已安装
    echo     版本: %NODE_VERSION%
)

echo.
echo 检查 npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo     ✗ npm 未安装或不在 PATH 中
    echo.
    echo 解决方法：
    echo 1. 重新安装 Node.js（npm 会自动安装）
    echo 2. 重启 PowerShell
    echo.
    goto :end
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo     ✓ npm 已安装
    echo     版本: %NPM_VERSION%
)

echo.
echo ========================================
echo    检查完成
echo ========================================
echo.
echo 下一步：
if "%NODE_VERSION%"=="" (
    echo ⚠ 需要先安装 Node.js
    echo 访问：https://nodejs.org/
    echo 下载并安装 LTS 版本
) else if "%NPM_VERSION%"=="" (
    echo ⚠ npm 有问题
    echo 尝试重新安装 Node.js
) else (
    echo ✓ Node.js 和 npm 都正常
    echo 可以继续使用 eas build
    echo.
    echo 在 PowerShell 中执行：
    echo   cd /d "D:\medicine-app"
    echo   npx eas login
)

:end
pause
