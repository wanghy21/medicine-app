@echo off
chcp 65001 >nul
echo ========================================
echo    停止构建并清理缓存
echo ========================================
echo.
echo 正在清理 Gradle 缓存...

:: 停止可能运行的 gradle 进程
taskkill /F /IM java.exe 2>nul
taskkill /F /IM gradle.exe 2>nul

set GRADLE_USER_HOME=C:\Users\Administrator\.gradle

:: 清理缓存目录
if exist "%GRADLE_USER_HOME%\caches" (
    echo     清理 caches...
    rmdir /s /q "%GRADLE_USER_HOME%\caches" 2>nul
    echo     ✓ caches 已清理
)

if exist "%GRADLE_USER_HOME%\daemon" (
    echo     清理 daemon...
    rmdir /s /q "%GRADLE_USER_HOME%\daemon" 2>nul
    echo     ✓ daemon 已清理
)

echo.
echo ========================================
echo ✓ 清理完成！
echo ========================================
echo.
echo 下一步：
echo 1. 双击"命令行构建APK.bat"
echo 2. 或者在 android 目录执行：
echo    .\gradlew.bat clean assembleDebug
echo.
pause
