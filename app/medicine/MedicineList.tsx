/**
 * 药品管理 - 列表页面
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
import { medicineOperations } from '../database/database';
import { Medicine } from '../types';
import {
  Card,
  Button,
  Input,
  SearchBar,
  Empty,
  Badge,
  CustomModal,
} from '../components/Common';
import { formatMoney, formatQuantity, formatDate } from '../utils/helpers';
import { theme } from '../utils/theme';

export const MedicineListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    spec: '',
    unit: '',
    price: '',
    cost: '',
    manufacturer: '',
    description: '',
    stock: '0',
    minStock: '10',
    expiryDate: '',
  });

  // 加载药品列表
  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await medicineOperations.getAll();
      setMedicines(data);
      setFilteredMedicines(data);
    } catch (error) {
      console.error('加载药品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新列表
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedicines();
    setRefreshing(false);
  };

  // 搜索
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    if (!keyword.trim()) {
      setFilteredMedicines(medicines);
      return;
    }
    const data = await medicineOperations.getAll(keyword);
    setFilteredMedicines(data);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: '',
      spec: '',
      unit: '',
      price: '',
      cost: '',
      manufacturer: '',
      description: '',
      stock: '0',
      minStock: '10',
      expiryDate: '',
    });
    setEditingMedicine(null);
  };

  // 添加/更新药品
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('请输入药品名称');
      return;
    }
    if (!formData.code.trim()) {
      alert('请输入药品编码');
      return;
    }

    try {
      if (editingMedicine) {
        // 更新
        await medicineOperations.update(editingMedicine.id, {
          name: formData.name,
          code: formData.code,
          category: formData.category,
          spec: formData.spec,
          unit: formData.unit,
          price: parseFloat(formData.price) || 0,
          cost: parseFloat(formData.cost) || 0,
          manufacturer: formData.manufacturer,
          description: formData.description,
          minStock: parseInt(formData.minStock) || 0,
          expiryDate: formData.expiryDate,
        });
      } else {
        // 添加
        await medicineOperations.add({
          name: formData.name,
          code: formData.code,
          category: formData.category,
          spec: formData.spec,
          unit: formData.unit,
          price: parseFloat(formData.price) || 0,
          cost: parseFloat(formData.cost) || 0,
          manufacturer: formData.manufacturer,
          description: formData.description,
          stock: parseInt(formData.stock) || 0,
          minStock: parseInt(formData.minStock) || 0,
          expiryDate: formData.expiryDate,
        });
      }
      setShowAddModal(false);
      resetForm();
      loadMedicines();
    } catch (error) {
      console.error('保存药品失败:', error);
      alert('保存失败，请重试');
    }
  };

  // 编辑药品
  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      code: medicine.code,
      category: medicine.category,
      spec: medicine.spec,
      unit: medicine.unit,
      price: medicine.price.toString(),
      cost: medicine.cost.toString(),
      manufacturer: medicine.manufacturer,
      description: medicine.description,
      stock: medicine.stock.toString(),
      minStock: medicine.minStock.toString(),
      expiryDate: medicine.expiryDate,
    });
    setShowAddModal(true);
  };

  // 删除药品
  const handleDelete = async (id: string) => {
    try {
      await medicineOperations.delete(id);
      loadMedicines();
    } catch (error) {
      console.error('删除药品失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 渲染药品项
  const renderMedicineItem = ({ item }: { item: Medicine }) => {
    const isLowStock = item.stock <= item.minStock;
    const isExpiring = item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return (
      <Card style={styles.medicineCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MedicineDetail' as never, { id: item.id } as never)}
        >
          <View style={styles.medicineHeader}>
            <View style={styles.medicineInfo}>
              <Text style={styles.medicineName}>{item.name}</Text>
              <Text style={styles.medicineCode}>{item.code}</Text>
            </View>
            <View style={styles.medicineTags}>
              {item.category && <Badge text={item.category} type="primary" />}
              {isLowStock && <Badge text="低库存" type="danger" />}
              {isExpiring && <Badge text="即将过期" type="warning" />}
            </View>
          </View>

          <View style={styles.medicineDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>规格：</Text>
              <Text style={styles.detailValue}>{item.spec || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>单位：</Text>
              <Text style={styles.detailValue}>{item.unit || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>售价：</Text>
              <Text style={[styles.detailValue, styles.price]}>{formatMoney(item.price)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>库存：</Text>
              <Text style={[styles.detailValue, isLowStock && styles.lowStock]}>
                {formatQuantity(item.stock)} {item.unit}
              </Text>
            </View>
          </View>

          {item.manufacturer && (
            <Text style={styles.manufacturer}>{item.manufacturer}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.medicineActions}>
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
    loadMedicines();
  }, []);

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchKeyword}
          onChangeText={handleSearch}
          placeholder="搜索药品名称、编码、分类"
        />
      </View>

      {/* 药品列表 */}
      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicineItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Empty
            message="暂无药品"
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
        title={editingMedicine ? '编辑药品' : '添加药品'}
      >
        <View style={styles.formContainer}>
          <Input
            label="药品名称 *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="请输入药品名称"
          />
          <Input
            label="药品编码 *"
            value={formData.code}
            onChangeText={(text) => setFormData({ ...formData, code: text })}
            placeholder="请输入药品编码（条形码）"
          />
          <Input
            label="药品分类"
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
            placeholder="请输入药品分类"
          />
          <View style={styles.formRow}>
            <View style={styles.formRowItem}>
              <Input
                label="规格"
                value={formData.spec}
                onChangeText={(text) => setFormData({ ...formData, spec: text })}
                placeholder="规格"
              />
            </View>
            <View style={styles.formRowItem}>
              <Input
                label="单位"
                value={formData.unit}
                onChangeText={(text) => setFormData({ ...formData, unit: text })}
                placeholder="单位"
              />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formRowItem}>
              <Input
                label="售价"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="售价"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formRowItem}>
              <Input
                label="成本价"
                value={formData.cost}
                onChangeText={(text) => setFormData({ ...formData, cost: text })}
                placeholder="成本价"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.formRowItem}>
              <Input
                label="初始库存"
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                placeholder="初始库存"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formRowItem}>
              <Input
                label="最低库存"
                value={formData.minStock}
                onChangeText={(text) => setFormData({ ...formData, minStock: text })}
                placeholder="最低库存"
                keyboardType="numeric"
              />
            </View>
          </View>
          <Input
            label="有效期"
            value={formData.expiryDate}
            onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
            placeholder="YYYY-MM-DD"
          />
          <Input
            label="生产商"
            value={formData.manufacturer}
            onChangeText={(text) => setFormData({ ...formData, manufacturer: text })}
            placeholder="请输入生产商"
          />
          <Input
            label="药品说明"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="请输入药品说明"
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
  medicineCard: {
    marginBottom: theme.spacing.md,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  medicineCode: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  medicineTags: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  medicineDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailRow: {
    width: '50%',
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  price: {
    color: theme.colors.error,
    fontWeight: theme.fontWeight.medium,
  },
  lowStock: {
    color: theme.colors.error,
  },
  manufacturer: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPlaceholder,
    marginTop: theme.spacing.xs,
  },
  medicineActions: {
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
  formRow: {
    flexDirection: 'row',
    marginHorizontal: -theme.spacing.xs,
  },
  formRowItem: {
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
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
