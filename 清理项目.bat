@echo off
chcp 65001 >nul
echo ========================================
echo    清理并重置项目
echo ========================================
echo.
echo ⚠ 警告：此操作将删除以下内容：
echo    - node_modules 文件夹（所有依赖）
echo    - .expo 文件夹（Expo 缓存）
echo.
echo 如果只是重新安装依赖，请双击"安装依赖.bat"
echo 如果确定要清理，请按任意键继续，或按 Ctrl+C 取消
pause >nul
echo.

echo 正在清理...
echo.

if exist "node_modules" (
    echo     删除 node_modules...
    rmdir /s /q node_modules
    echo     ✓ node_modules 已删除
)

if exist ".expo" (
    echo     删除 .expo 缓存...
    rmdir /s /q .expo
    echo     ✓ .expo 已删除
)

if exist "dist" (
    echo     删除 dist 文件夹...
    rmdir /s /q dist
    echo     ✓ dist 已删除
)

if exist ".expo-shared" (
    echo     删除 .expo-shared 文件夹...
    rmdir /s /q .expo-shared
    echo     ✓ .expo-shared 已删除
)

echo.
echo ========================================
echo    ✓ 清理完成！
echo ========================================
echo.
echo 下一步：
echo 1. 双击"安装依赖.bat" 重新安装
echo 2. 或者在命令行执行 npm install
echo.
pause
