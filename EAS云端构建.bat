@echo off
chcp 65001 >nul
echo ========================================
echo    使用 EAS Build 云端构建 APK
echo ========================================
echo.
echo 这种方法不需要处理 Gradle 问题！
echo 在云端自动构建，完成后下载 APK。
echo.
echo ⚠ 注意：
echo 1. 首次使用需要登录 Expo 账户（免费）
echo 2. 构建时间约 10-20 分钟
echo 3. 完成后提供下载链接
echo.
echo ========================================
echo 开始构建...
echo ========================================
echo.

cd /d "%~dp0"

call npx eas build --platform android --profile preview

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓ 构建请求已提交！
    echo ========================================
    echo.
    echo 接下来：
    echo 1. 等待 10-20 分钟
    echo 2. 收到邮件通知（如果登录了）
    echo 3. 或者在命令行查看进度
    echo 4. 构建完成后会提供下载链接
    echo.
) else (
    echo.
    echo ========================================
    echo ✗ 构建失败
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 没有登录 Expo 账户
    echo 2. 网络问题
    echo 3. 项目配置问题
    echo.
    echo 解决方法：
    echo 1. 先运行：npx eas login
    echo 2. 然后重新运行本脚本
    echo.
)

pause
