/**
 * 药品管理系统 - 主应用入口
 */
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from './database/database';
import { TabNavigator } from './app/tabs/TabNavigator';
import { Loading } from './components/Common';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化数据库
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('开始初始化数据库...');
        await initDatabase();
        console.log('数据库初始化成功');
        setDbInitialized(true);
      } catch (err) {
        console.error('数据库初始化失败:', err);
        setError('数据库初始化失败，请重启应用');
      }
    };

    initialize();
  }, []);

  // 显示加载状态
  if (!dbInitialized) {
    return (
      <Loading
        text="正在初始化..."
        fullScreen
      />
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <Loading
        text={error}
        fullScreen
      />
    );
  }

  // 正常渲染应用
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
