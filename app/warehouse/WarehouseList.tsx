/**
 * 仓库管理 - 列表页面
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { warehouseOperations } from '../database/database';
import { Warehouse } from '../types';
import {
  Card,
  Button,
  Input,
  SearchBar,
  Empty,
  CustomModal,
} from '../components/Common';
import { formatQuantity } from '../utils/helpers';
import { theme } from '../utils/theme';

export const WarehouseListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    manager: '',
    phone: '',
    description: '',
  });

  // 加载仓库列表
  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const data = await warehouseOperations.getAll();
      setWarehouses(data);
    } catch (error) {
      console.error('加载仓库失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新列表
  const onRefresh = async () => {
    setRefreshing(true);
    await loadWarehouses();
    setRefreshing(false);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      capacity: '',
      manager: '',
      phone: '',
      description: '',
    });
    setEditingWarehouse(null);
  };

  // 添加/更新仓库
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('请输入仓库名称');
      return;
    }

    try {
      if (editingWarehouse) {
        // 更新
        await warehouseOperations.update(editingWarehouse.id, {
          name: formData.name,
          location: formData.location,
          capacity: parseInt(formData.capacity) || 0,
          manager: formData.manager,
          phone: formData.phone,
          description: formData.description,
        });
      } else {
        // 添加
        await warehouseOperations.add({
          name: formData.name,
          location: formData.location,
          capacity: parseInt(formData.capacity) || 0,
          currentStock: 0,
          manager: formData.manager,
          phone: formData.phone,
          description: formData.description,
        });
      }
      setShowAddModal(false);
      resetForm();
      loadWarehouses();
    } catch (error) {
      console.error('保存仓库失败:', error);
      alert('保存失败，请重试');
    }
  };

  // 编辑仓库
  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity?.toString() || '',
      manager: warehouse.manager,
      phone: warehouse.phone,
      description: warehouse.description,
    });
    setShowAddModal(true);
  };

  // 删除仓库
  const handleDelete = async (id: string) => {
    try {
      await warehouseOperations.delete(id);
      loadWarehouses();
    } catch (error) {
      console.error('删除仓库失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 渲染仓库项
  const renderWarehouseItem = ({ item }: { item: Warehouse }) => {
    const usageRate = item.capacity > 0
      ? ((item.currentStock || 0) / item.capacity * 100).toFixed(1)
      : 0;

    return (
      <Card style={styles.warehouseCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('WarehouseDetail' as never, { id: item.id } as never)}
        >
          <View style={styles.warehouseHeader}>
            <View style={styles.warehouseInfo}>
              <Text style={styles.warehouseName}>{item.name}</Text>
              <Text style={styles.warehouseLocation}>{item.location || '未设置位置'}</Text>
            </View>
          </View>

          <View style={styles.warehouseStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatQuantity(item.currentStock || 0)}</Text>
              <Text style={styles.statLabel}>当前库存</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatQuantity(item.capacity || 0)}</Text>
              <Text style={styles.statLabel}>总容量</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, Number(usageRate) > 90 && styles.warningText]}>
                {usageRate}%
              </Text>
              <Text style={styles.statLabel}>使用率</Text>
            </View>
          </View>

          {item.manager && (
            <View style={styles.warehouseManager}>
              <Text style={styles.managerLabel}>管理员：</Text>
              <Text style={styles.managerValue}>{item.manager}</Text>
              {item.phone && (
                <>
                  <Text style={styles.managerDivider}> | </Text>
                  <Text style={styles.managerValue}>{item.phone}</Text>
                </>
              )}
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.warehouseActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.actionButtonText}>编辑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.actionButtonText}>删除</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          placeholder="搜索仓库名称"
        />
      </View>

      {/* 仓库列表 */}
      <FlatList
        data={warehouses}
        renderItem={renderWarehouseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Empty
            message="暂无仓库"
            onRefresh={onRefresh}
            refreshText="刷新"
          />
        }
      />

      {/* 添加按钮 */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setShowAddModal(true);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* 添加/编辑弹窗 */}
      <CustomModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingWarehouse ? '编辑仓库' : '添加仓库'}
      >
        <View style={styles.formContainer}>
          <Input
            label="仓库名称 *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="请输入仓库名称"
          />
          <Input
            label="仓库位置"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholder="请输入仓库位置"
          />
          <Input
            label="仓库容量"
            value={formData.capacity}
            onChangeText={(text) => setFormData({ ...formData, capacity: text })}
            placeholder="请输入仓库容量"
            keyboardType="numeric"
          />
          <Input
            label="管理员"
            value={formData.manager}
            onChangeText={(text) => setFormData({ ...formData, manager: text })}
            placeholder="请输入管理员姓名"
          />
          <Input
            label="联系电话"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="请输入联系电话"
            keyboardType="phone-pad"
          />
          <Input
            label="仓库说明"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="请输入仓库说明"
            multiline
          />

          <View style={styles.formActions}>
            <Button
              title="取消"
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
              type="default"
              style={styles.formActionButton}
            />
            <Button
              title="保存"
              onPress={handleSubmit}
              type="primary"
              style={[styles.formActionButton, styles.formActionSubmit]}
            />
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  warehouseCard: {
    marginBottom: theme.spacing.md,
  },
  warehouseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  warehouseInfo: {
    flex: 1,
  },
  warehouseName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  warehouseLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  warehouseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  warningText: {
    color: theme.colors.warning,
  },
  warehouseManager: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  managerLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  managerValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  managerDivider: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPlaceholder,
    marginHorizontal: theme.spacing.xs,
  },
  warehouseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.sm,
  },
  addButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.large,
  },
  addButtonText: {
    fontSize: 28,
    color: '#fff',
    marginTop: -2,
  },
  formContainer: {
    paddingBottom: theme.spacing.md,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
  formActionButton: {
    minWidth: 80,
    marginLeft: theme.spacing.sm,
  },
  formActionSubmit: {
    marginLeft: theme.spacing.sm,
  },
});
