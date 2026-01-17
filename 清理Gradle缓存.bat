@echo off
chcp 65001 >nul
echo ========================================
echo    清理 Gradle 缓存
echo ========================================
echo.
echo ⚠ 警告：此操作将删除 Gradle 下载的文件
echo 但不会影响项目代码
echo.
echo 按任意键继续，或按 Ctrl+C 取消
pause >nul
echo.

echo 正在清理 Gradle 缓存...

set GRADLE_USER_HOME=C:\Users\Administrator\.gradle

if exist "%GRADLE_USER_HOME%" (
    echo 正在删除 wrapper\dists 目录...
    rmdir /s /q "%GRADLE_USER_HOME%\wrapper\dists" 2>nul
    if exist "%GRADLE_USER_HOME%\wrapper\dists" (
        echo     删除失败，可能文件被占用
    ) else (
        echo     ✓ wrapper\dists 已删除
    )

    echo 正在删除 caches 目录...
    rmdir /s /q "%GRADLE_USER_HOME%\caches" 2>nul
    if exist "%GRADLE_USER_HOME%\caches" (
        echo     删除失败
    ) else (
        echo     ✓ caches 已删除
    )

    echo.
    echo ========================================
    echo ✓ 清理完成！
    echo ========================================
    echo.
    echo 下一步：
    echo 1. 双击"命令行构建APK.bat" 重新构建
    echo 2. 或者在 Android Studio 中重新同步
    echo.
) else (
    echo.
    echo ========================================
    echo ✗ Gradle 缓存目录不存在
    echo ========================================
    echo.
    echo 路径：%GRADLE_USER_HOME%
    echo.
)

pause
