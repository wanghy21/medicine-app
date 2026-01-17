/**
 * 交易记录 - 列表页面
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
import { transactionOperations, medicineOperations, warehouseOperations, clientOperations } from '../database/database';
import { Transaction } from '../types';
import {
  Card,
  Button,
  Input,
  SearchBar,
  Empty,
  Badge,
  CustomModal,
} from '../components/Common';
import { formatMoney, formatDateTime, getStatusColor, getStatusText } from '../utils/helpers';
import { theme } from '../utils/theme';

export const TransactionListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // 筛选状态
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // 表单状态
  const [formData, setFormData] = useState({
    type: 'in' as const,
    medicineId: '',
    warehouseId: '',
    clientId: '',
    quantity: '1',
    unitPrice: '0',
    batchNo: '',
    remark: '',
  });

  // 选项数据
  const [medicines, setMedicines] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  // 交易类型列表
  const transactionTypes = [
    { value: 'in', label: '入库', color: 'success' },
    { value: 'out', label: '出库', color: 'primary' },
    { value: 'return', label: '退货', color: 'warning' },
    { value: 'adjust', label: '调整', color: 'default' },
  ];

  // 加载交易记录
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const result = await transactionOperations.getAll({
        type: filterType || undefined,
        startDate: filterDate ? `${filterDate} 00:00:00` : undefined,
        endDate: filterDate ? `${filterDate} 23:59:59` : undefined,
      });
      setTransactions(result.transactions);
      setTotal(result.total);
    } catch (error) {
      console.error('加载交易记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载选项数据
  const loadOptions = async () => {
    try {
      const [medList, whList, clList] = await Promise.all([
        medicineOperations.getAll(),
        warehouseOperations.getAll(),
        clientOperations.getAll(),
      ]);
      setMedicines(medList);
      setWarehouses(whList);
      setClients(clList);
    } catch (error) {
      console.error('加载选项数据失败:', error);
    }
  };

  // 刷新列表
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      type: 'in',
      medicineId: '',
      warehouseId: '',
      clientId: '',
      quantity: '1',
      unitPrice: '0',
      batchNo: '',
      remark: '',
    });
  };

  // 添加交易
  const handleSubmit = async () => {
    if (!formData.medicineId) {
      alert('请选择药品');
      return;
    }
    if (!formData.warehouseId) {
      alert('请选择仓库');
      return;
    }
    if (formData.type === 'out' && !formData.clientId) {
      alert('请选择客户');
      return;
    }

    try {
      // 获取药品和仓库信息
      const medicine = await medicineOperations.getById(formData.medicineId);
      const warehouse = await warehouseOperations.getById(formData.warehouseId);
      const client = formData.clientId ? await clientOperations.getById(formData.clientId) : null;

      if (!medicine || !warehouse) {
        alert('药品或仓库不存在');
        return;
      }

      const quantity = parseInt(formData.quantity) || 1;
      const unitPrice = parseFloat(formData.unitPrice) || medicine.price;
      const totalAmount = quantity * unitPrice;

      // 创建交易记录
      await transactionOperations.add({
        type: formData.type,
        medicineId: formData.medicineId,
        medicineName: medicine.name,
        warehouseId: formData.warehouseId,
        warehouseName: warehouse.name,
        clientId: formData.clientId,
        clientName: client?.name || '',
        quantity,
        unitPrice,
        totalAmount,
        batchNo: formData.batchNo,
        operator: '管理员',
        remark: formData.remark,
      });

      // 更新库存
      let stockChange = quantity;
      if (formData.type === 'out' || formData.type === 'return') {
        stockChange = -quantity;
      }
      await medicineOperations.updateStock(formData.medicineId, stockChange);

      setShowAddModal(false);
      resetForm();
      loadTransactions();
    } catch (error) {
      console.error('创建交易失败:', error);
      alert('创建失败，请重试');
    }
  };

  // 获取交易类型颜色
  const getTypeColor = (type: string): 'success' | 'primary' | 'warning' | 'default' => {
    const found = transactionTypes.find(t => t.value === type);
    return (found?.color as any) || 'default';
  };

  // 渲染交易项
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
      <Card style={styles.transactionCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('TransactionDetail' as never, { id: item.id } as never)}
        >
          <View style={styles.transactionHeader}>
            <View style={styles.transactionType}>
              <Badge text={getStatusText(item.type)} type={getTypeColor(item.type)} />
            </View>
            <Text style={styles.transactionTime}>
              {formatDateTime(item.createdAt)}
            </Text>
          </View>

          <View style={styles.transactionInfo}>
            <Text style={styles.medicineName}>{item.medicineName}</Text>
            <Text style={styles.batchNo}>批次号: {item.batchNo || '-'}</Text>
          </View>

          <View style={styles.transactionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>数量：</Text>
              <Text style={styles.detailValue}>
                {item.quantity} {item.unitPrice > 0 ? '' : ''}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>单价：</Text>
              <Text style={styles.detailValue}>{formatMoney(item.unitPrice)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>仓库：</Text>
              <Text style={styles.detailValue}>{item.warehouseName}</Text>
            </View>
            {item.clientName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>客户：</Text>
                <Text style={styles.detailValue}>{item.clientName}</Text>
              </View>
            )}
          </View>

          <View style={styles.transactionTotal}>
            <Text style={styles.totalLabel}>总计：</Text>
            <Text style={styles.totalValue}>
              {formatMoney(item.totalAmount)}
            </Text>
          </View>

          {item.remark && (
            <Text style={styles.remark}>{item.remark}</Text>
          )}
        </TouchableOpacity>
      </Card>
    );
  };

  useEffect(() => {
    loadTransactions();
    loadOptions();
  }, [filterType, filterDate]);

  return (
    <View style={styles.container}>
      {/* 筛选栏 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterType && styles.filterButtonActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={[styles.filterButtonText, filterType && styles.filterButtonTextActive]}>
            {filterType ? getStatusText(filterType) : '全部类型'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterDate && styles.filterButtonActive]}
          onPress={() => {
            setFilterDate(filterDate ? '' : new Date().toISOString().split('T')[0]);
          }}
        >
          <Text style={[styles.filterButtonText, filterDate && styles.filterButtonTextActive]}>
            {filterDate ? filterDate : '全部日期'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 交易记录列表 */}
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Empty
            message="暂无交易记录"
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

      {/* 添加交易弹窗 */}
      <CustomModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="添加交易"
      >
        <View style={styles.formContainer}>
          {/* 交易类型选择 */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>交易类型</Text>
            <View style={styles.typeSelector}>
              {transactionTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    formData.type === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.value as any })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type.value && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 药品选择 */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>药品 *</Text>
            <View style={styles.pickerContainer}>
              {medicines.length === 0 ? (
                <Text style={styles.pickerPlaceholder}>暂无药品，请先添加</Text>
              ) : (
                medicines.map((med) => (
                  <TouchableOpacity
                    key={med.id}
                    style={[
                      styles.pickerItem,
                      formData.medicineId === med.id && styles.pickerItemActive,
                    ]}
                    onPress={() => setFormData({ ...formData, medicineId: med.id })}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        formData.medicineId === med.id && styles.pickerItemTextActive,
                      ]}
                    >
                      {med.name} ({med.code})
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          {/* 仓库选择 */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>仓库 *</Text>
            <View style={styles.pickerContainer}>
              {warehouses.length === 0 ? (
                <Text style={styles.pickerPlaceholder}>暂无仓库，请先添加</Text>
              ) : (
                warehouses.map((wh) => (
                  <TouchableOpacity
                    key={wh.id}
                    style={[
                      styles.pickerItem,
                      formData.warehouseId === wh.id && styles.pickerItemActive,
                    ]}
                    onPress={() => setFormData({ ...formData, warehouseId: wh.id })}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        formData.warehouseId === wh.id && styles.pickerItemTextActive,
                      ]}
                    >
                      {wh.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          {/* 客户选择（出库时必填） */}
          {formData.type === 'out' && (
            <View style={styles.formField}>
              <Text style={styles.inputLabel}>客户 *</Text>
              <View style={styles.pickerContainer}>
                {clients.length === 0 ? (
                  <Text style={styles.pickerPlaceholder}>暂无客户，请先添加</Text>
                ) : (
                  clients.map((client) => (
                    <TouchableOpacity
                      key={client.id}
                      style={[
                        styles.pickerItem,
                        formData.clientId === client.id && styles.pickerItemActive,
                      ]}
                      onPress={() => setFormData({ ...formData, clientId: client.id })}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          formData.clientId === client.id && styles.pickerItemTextActive,
                        ]}
                      >
                        {client.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}

          <View style={styles.formRow}>
            <View style={styles.formRowItem}>
              <Input
                label="数量"
                value={formData.quantity}
                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                placeholder="数量"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formRowItem}>
              <Input
                label="单价"
                value={formData.unitPrice}
                onChangeText={(text) => setFormData({ ...formData, unitPrice: text })}
                placeholder="单价"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="批次号"
            value={formData.batchNo}
            onChangeText={(text) => setFormData({ ...formData, batchNo: text })}
            placeholder="批次号（可选）"
          />

          <Input
            label="备注"
            value={formData.remark}
            onChangeText={(text) => setFormData({ ...formData, remark: text })}
            placeholder="备注（可选）"
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
              title="确认"
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
  filterContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  transactionCard: {
    marginBottom: theme.spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  transactionType: {},
  transactionTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPlaceholder,
  },
  transactionInfo: {
    marginBottom: theme.spacing.sm,
  },
  medicineName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  batchNo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  transactionDetails: {
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
  transactionTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  totalLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  totalValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.error,
  },
  remark: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPlaceholder,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
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
  formField: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  pickerContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  pickerPlaceholder: {
    padding: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPlaceholder,
    textAlign: 'center',
  },
  pickerItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  pickerItemActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  pickerItemText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  pickerItemTextActive: {
    color: '#fff',
    fontWeight: theme.fontWeight.medium,
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
