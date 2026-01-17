@echo off
chcp 65001 >nul
echo ========================================
echo    药品管理系统 - 启动开发服务器
echo ========================================
echo.
echo 正在启动开发服务器...
echo.
echo 启动后，请在手机上：
echo 1. 打开 Expo Go 应用
echo 2. 扫描下方二维码
echo 3. 或者手动输入显示的地址
echo.
echo 按 Ctrl+C 可以停止服务器
echo.
echo ========================================
echo.

npm start
