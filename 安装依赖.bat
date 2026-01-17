@echo off
chcp 65001 >nul
echo ========================================
echo    药品管理系统 - 安装依赖
echo ========================================
echo.
echo 正在安装项目所需的依赖包...
echo 这可能需要几分钟，请耐心等待...
echo.

npm install

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    ✓ 安装完成！
    echo ========================================
    echo.
    echo 下一步：
    echo 1. 双击 start.bat 启动开发服务器
    echo 2. 或者在命令行执行 npm start
    echo.
) else (
    echo.
    echo ========================================
    echo    ✗ 安装失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题 - 请重试
    echo 2. Node.js 未安装 - 请先安装 Node.js
    echo 3. 权限不足 - 请以管理员身份运行
    echo.
)

pause
