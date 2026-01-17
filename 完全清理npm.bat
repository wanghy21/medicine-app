@echo off
chcp 65001 >nul
echo ========================================
echo    完全清理 npm 并重置
echo ========================================
echo.
echo ⚠ 警告：此操作将删除 npm 缓存
echo 和 node_modules
echo.

echo [1/3] 清理 npm 缓存...
call npm cache clean --force
if %errorlevel% equ 0 (
    echo     ✓ npm 缓存清理成功
) else (
    echo     ✗ npm 缓存清理失败
    goto :end
)

echo.
echo [2/3] 删除 node_modules...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo     ✓ node_modules 已删除
) else (
    echo     ⚠ node_modules 不存在
)

echo.
echo [3/3] 删除 package-lock.json...
if exist "package-lock.json" (
    del /q package-lock.json
    echo     ✓ package-lock.json 已删除
) else (
    echo     ⚠ package-lock.json 不存在
)

echo.
echo ========================================
echo    ✓ 清理完成！
echo ========================================
echo.
echo 下一步：
echo 1. 重新安装依赖：npm install
echo 2. 然后尝试：npx eas login
echo.
pause
