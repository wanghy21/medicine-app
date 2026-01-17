/**
 * 标签页导航配置
 */
import React from 'react';
import { Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MedicineListScreen } from '../medicine/MedicineList';
import { WarehouseListScreen } from '../warehouse/WarehouseList';
import { ClientListScreen } from '../client/ClientList';
import { TransactionListScreen } from '../transactions/TransactionList';
import { StatisticsScreen } from '../statistics/StatisticsScreen';
import { theme } from '../../utils/theme';

// 标签页参数列表
export type TabParamList = {
  Statistics: undefined;
  Medicine: undefined;
  Warehouse: undefined;
  Client: undefined;
  Transaction: undefined;
};

// 创建标签页导航器
const Tab = createBottomTabNavigator<TabParamList>();

// 自定义标签图标组件
const TabIcon = ({
  name,
  focused,
}: {
  name: 'Statistics' | 'Medicine' | 'Warehouse' | 'Client' | 'Transaction';
  focused: boolean;
}) => {
  const iconMap: Record<string, string> = {
    Statistics: '📊',
    Medicine: '💊',
    Warehouse: '🏭',
    Client: '👥',
    Transaction: '📋',
  };

  const labelMap: Record<string, string> = {
    Statistics: '统计',
    Medicine: '药品',
    Warehouse: '仓库',
    Client: '客户',
    Transaction: '交易',
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {iconMap[name]}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {labelMap[name]}
      </Text>
    </View>
  );
};

// 标签页导航器组件
export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name as keyof typeof iconMap} focused={focused} />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textPlaceholder,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          height: 60 + (theme.spacing.sm as number),
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: theme.fontWeight.bold,
        },
      })}
    >
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: '统计',
          headerTitle: '数据统计',
        }}
      />
      <Tab.Screen
        name="Medicine"
        component={MedicineListScreen}
        options={{
          title: '药品',
          headerTitle: '药品管理',
        }}
      />
      <Tab.Screen
        name="Warehouse"
        component={WarehouseListScreen}
        options={{
          title: '仓库',
          headerTitle: '仓库管理',
        }}
      />
      <Tab.Screen
        name="Client"
        component={ClientListScreen}
        options={{
          title: '客户',
          headerTitle: '客户管理',
        }}
      />
      <Tab.Screen
        name="Transaction"
        component={TransactionListScreen}
        options={{
          title: '交易',
          headerTitle: '交易记录',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = {
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPlaceholder,
  },
  tabLabelFocused: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
};
