@echo off
chcp 65001 >nul
echo ========================================
echo    环境检查工具
echo ========================================
echo.

echo [1/4] 检查 Node.js 安装情况...
where node >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo     ✓ Node.js 已安装
    echo     版本: %NODE_VERSION%
) else (
    echo     ✗ Node.js 未安装
    echo     请先安装 Node.js: https://nodejs.org/
    goto :end
)
echo.

echo [2/4] 检查 npm 安装情况...
where npm >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo     ✓ npm 已安装
    echo     版本: %NPM_VERSION%
) else (
    echo     ✗ npm 未安装
    echo     请重新安装 Node.js
    goto :end
)
echo.

echo [3/4] 检查项目文件...
if exist "package.json" (
    echo     ✓ package.json 存在
) else (
    echo     ✗ package.json 不存在
    echo     请确保在正确的项目目录
    goto :end
)

if exist "tsconfig.json" (
    echo     ✓ tsconfig.json 存在
) else (
    echo     ✗ tsconfig.json 不存在
)

if exist "app\" (
    echo     ✓ app 目录存在
) else (
    echo     ✗ app 目录不存在
)
echo.

echo [4/4] 检查 node_modules...
if exist "node_modules\" (
    echo     ✓ node_modules 已存在
    echo     依赖已安装
) else (
    echo     ⚠ node_modules 不存在
    echo     需要先安装依赖：双击"安装依赖.bat"
)
echo.

echo ========================================
echo    检查完成
echo ========================================
echo.
echo 检查结果：
if exist "node_modules\" (
    echo ✓ 环境就绪，可以启动应用
    echo 下一步：双击"启动服务器.bat"
) else (
    echo ⚠ 需要先安装依赖
    echo 下一步：双击"安装依赖.bat"
)
echo.

:end
pause
