/**
 * 统计报表 - 首页
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  medicineOperations,
  warehouseOperations,
  clientOperations,
  transactionOperations,
} from '../database/database';
import { Card, Badge, Empty } from '../components/Common';
import {
  formatMoney,
  formatQuantity,
  formatDate,
} from '../utils/helpers';
import { theme } from '../utils/theme';

export const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 统计数据
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalStockValue: 0,
    totalWarehouses: 0,
    totalClients: 0,
    todayTransactions: 0,
    todayInAmount: 0,
    todayOutAmount: 0,
    monthlySales: 0,
    lowStockCount: 0,
    expiringCount: 0,
  });

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [
        medicines,
        warehouses,
        clients,
        todaySummary,
        monthlySales,
        lowStock,
        expiring,
      ] = await Promise.all([
        medicineOperations.getAll(),
        warehouseOperations.getAll(),
        clientOperations.getAll(),
        transactionOperations.getTodaySummary(),
        transactionOperations.getMonthlySales(),
        medicineOperations.getLowStock(),
        medicineOperations.getExpiringSoon(30),
      ]);

      // 计算库存总价值
      const stockValue = medicines.reduce(
        (total, med) => total + med.stock * med.cost,
        0
      );

      setStats({
        totalMedicines: medicines.length,
        totalStockValue: stockValue,
        totalWarehouses: warehouses.length,
        totalClients: clients.length,
        todayTransactions: todaySummary.count,
        todayInAmount: todaySummary.inAmount,
        todayOutAmount: todaySummary.outAmount,
        monthlySales: monthlySales,
        lowStockCount: lowStock.length,
        expiringCount: expiring.length,
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  // 渲染统计卡片
  const renderStatCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    onPress?: () => void
  ) => (
    <Card style={styles.statCard} onPress={onPress}>
      <Text style={styles.statCardTitle}>{title}</Text>
      <Text style={styles.statCardValue}>{value}</Text>
      {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
    </Card>
  );

  // 快捷入口
  const renderQuickEntry = (
    title: string,
    icon: string,
    onPress: () => void,
    badge?: string
  ) => (
    <TouchableOpacity style={styles.quickEntry} onPress={onPress}>
      <Text style={styles.quickEntryIcon}>{icon}</Text>
      <Text style={styles.quickEntryTitle}>{title}</Text>
      {badge && <Badge text={badge} type="danger" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 今日概览 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今日概览</Text>
        <View style={styles.todayOverview}>
          <View style={styles.todayStat}>
            <Text style={styles.todayStatValue}>{stats.todayTransactions}</Text>
            <Text style={styles.todayStatLabel}>交易次数</Text>
          </View>
          <View style={styles.todayStatDivider} />
          <View style={styles.todayStat}>
            <Text style={[styles.todayStatValue, styles.incomeText]}>
              {formatMoney(stats.todayInAmount)}
            </Text>
            <Text style={styles.todayStatLabel}>入库金额</Text>
          </View>
          <View style={styles.todayStatDivider} />
          <View style={styles.todayStat}>
            <Text style={[styles.todayStatValue, styles.expenseText]}>
              {formatMoney(stats.todayOutAmount)}
            </Text>
            <Text style={styles.todayStatLabel}>出库金额</Text>
          </View>
        </View>
      </View>

      {/* 核心指标 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>核心指标</Text>
        <View style={styles.coreStatsGrid}>
          {renderStatCard(
            '药品总数',
            formatQuantity(stats.totalMedicines),
            '种药品'
          )}
          {renderStatCard(
            '库存价值',
            formatMoney(stats.totalStockValue),
            '总库存价值'
          )}
          {renderStatCard(
            '仓库数量',
            formatQuantity(stats.totalWarehouses),
            '个仓库'
          )}
          {renderStatCard(
            '客户数量',
            formatQuantity(stats.totalClients),
            '个客户'
          )}
        </View>
      </View>

      {/* 销售数据 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>销售数据</Text>
        <Card style={styles.salesCard}>
          <View style={styles.salesRow}>
            <View style={styles.salesItem}>
              <Text style={styles.salesLabel}>本月销售额</Text>
              <Text style={styles.salesValue}>{formatMoney(stats.monthlySales)}</Text>
            </View>
            <View style={styles.salesIndicator}>
              <View
                style={[
                  styles.salesIndicatorBar,
                  { width: '60%' },
                ]}
              />
            </View>
          </View>
        </Card>
      </View>

      {/* 预警信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>预警信息</Text>
        <View style={styles.warningGrid}>
          <TouchableOpacity
            style={styles.warningCard}
            onPress={() => navigation.navigate('MedicineList' as never)}
          >
            <View style={[styles.warningIcon, styles.warningIconDanger]}>
              <Text style={styles.warningIconText}>⚠️</Text>
            </View>
            <View style={styles.warningInfo}>
              <Text style={styles.warningTitle}>低库存预警</Text>
              <Text style={styles.warningValue}>{stats.lowStockCount} 种药品</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.warningCard}
            onPress={() => navigation.navigate('MedicineList' as never)}
          >
            <View style={[styles.warningIcon, styles.warningIconWarning]}>
              <Text style={styles.warningIconText}>⏰</Text>
            </View>
            <View style={styles.warningInfo}>
              <Text style={styles.warningTitle}>即将过期</Text>
              <Text style={styles.warningValue}>{stats.expiringCount} 种药品</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 快捷入口 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快捷入口</Text>
        <View style={styles.quickEntries}>
          {renderQuickEntry(
            '药品管理',
            '💊',
            () => navigation.navigate('MedicineList' as never)
          )}
          {renderQuickEntry(
            '仓库管理',
            '🏭',
            () => navigation.navigate('WarehouseList' as never)
          )}
          {renderQuickEntry(
            '客户管理',
            '👥',
            () => navigation.navigate('ClientList' as never)
          )}
          {renderQuickEntry(
            '交易记录',
            '📋',
            () => navigation.navigate('TransactionList' as never),
            stats.todayTransactions > 0 ? `${stats.todayTransactions}条` : undefined
          )}
        </View>
      </View>

      {/* 日期信息 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          更新于 {formatDate(new Date().toISOString(), 'HH:mm')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  todayOverview: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.medium,
  },
  todayStat: {
    flex: 1,
    alignItems: 'center',
  },
  todayStatValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  incomeText: {
    color: theme.colors.success,
  },
  expenseText: {
    color: theme.colors.error,
  },
  todayStatLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  todayStatDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  coreStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  statCard: {
    width: '50%',
    padding: theme.spacing.md,
  },
  statCardTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statCardValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  statCardSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPlaceholder,
    marginTop: 2,
  },
  salesCard: {
    marginBottom: theme.spacing.md,
  },
  salesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salesItem: {
    flex: 1,
  },
  salesLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  salesValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: 4,
  },
  salesIndicator: {
    width: 100,
    height: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  salesIndicatorBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  warningGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  warningCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadow.small,
  },
  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  warningIconDanger: {
    backgroundColor: '#fff2f0',
  },
  warningIconWarning: {
    backgroundColor: '#fffbe6',
  },
  warningIconText: {
    fontSize: 24,
  },
  warningInfo: {
    flex: 1,
  },
  warningTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  warningValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  quickEntries: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickEntry: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadow.small,
  },
  quickEntryIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  quickEntryTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPlaceholder,
  },
});
