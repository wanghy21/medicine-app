@echo off
chcp 65001 >nul
echo ========================================
echo    命令行构建 APK - 最简单的方法
echo ========================================
echo.
echo 这种方法不需要 Android Studio，不需要配置 Gradle！
echo 只需要几个命令就能构建 APK。
echo.
echo ========================================
echo 第 1/4 步：预构建项目
echo ========================================
echo.

call npx expo prebuild --platform android --clean

if %errorlevel% neq 0 (
    echo.
    echo 预构建失败！请检查错误信息。
    pause
    exit /b 1
)

echo.
echo ========================================
echo 第 2/4 步：进入 android 目录
echo ========================================
echo.

cd android

if %errorlevel% neq 0 (
    echo.
    echo 无法进入 android 目录！
    pause
    exit /b 1
)

echo 当前目录: %CD%
echo.

echo ========================================
echo 第 3/4 步：构建 Debug APK
echo ========================================
echo.
echo 这可能需要 5-10 分钟，请耐心等待...
echo.

call gradlew.bat assembleDebug

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo 构建失败！
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. Java/JDK 未安装 - 请先安装 JDK 17
    echo 2. 网络问题 - 请检查网络连接
    echo 3. Gradle 下载失败 - 重试几次
    echo.
    echo 建议：
    echo 1. 检查 JDK: java -version
    echo 2. 清理缓存后重试
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo 第 4/4 步：查找 APK 文件
echo ========================================
echo.

cd ..
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk

if exist "%APK_PATH%" (
    echo ========================================
    echo ✓ 构建成功！
    echo ========================================
    echo.
    echo APK 文件位置：
    echo %CD%\%APK_PATH%
    echo.
    echo 完整路径：
    echo %CD%\android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo 下一步：
    echo 1. 复制这个 APK 文件到手机
    echo 2. 在手机上安装
    echo.
    echo ========================================
    echo 是否要打开 APK 所在的文件夹？(Y/N)
    echo ========================================
    choice /C YN /N /M "打开文件夹？"
    if errorlevel 2 goto :end
    if errorlevel 1 (
        explorer android\app\build\outputs\apk\debug
    )
) else (
    echo ========================================
    echo ✗ 未找到 APK 文件
    echo ========================================
    echo.
    echo 构建可能失败了，请检查上面的错误信息。
    echo.
    echo 尝试手动查找：
    echo android\app\build\outputs\apk\debug\
    echo.
)

:end
pause
