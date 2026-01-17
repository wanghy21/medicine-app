/**
 * 客户管理 - 列表页面
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
import { clientOperations } from '../database/database';
import { Client } from '../types';
import {
  Card,
  Button,
  Input,
  SearchBar,
  Empty,
  Badge,
  CustomModal,
} from '../components/Common';
import { formatMoney, formatPhone } from '../utils/helpers';
import { theme } from '../utils/theme';

export const ClientListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    type: 'retail' as const,
    phone: '',
    address: '',
    email: '',
    credit: '0',
    description: '',
  });

  // 客户类型列表
  const clientTypes = [
    { value: 'retail', label: '零售客户' },
    { value: 'wholesale', label: '批发客户' },
    { value: 'hospital', label: '医院' },
    { value: 'clinic', label: '诊所' },
  ];

  // 加载客户列表
  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientOperations.getAll();
      setClients(data);
    } catch (error) {
      console.error('加载客户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新列表
  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  // 搜索
  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    if (!keyword.trim()) {
      loadClients();
      return;
    }
    const data = await clientOperations.getAll(keyword);
    setClients(data);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'retail',
      phone: '',
      address: '',
      email: '',
      credit: '0',
      description: '',
    });
    setEditingClient(null);
  };

  // 添加/更新客户
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('请输入客户名称');
      return;
    }

    try {
      if (editingClient) {
        // 更新
        await clientOperations.update(editingClient.id, {
          name: formData.name,
          type: formData.type,
          phone: formData.phone,
          address: formData.address,
          email: formData.email,
          credit: parseFloat(formData.credit) || 0,
          description: formData.description,
        });
      } else {
        // 添加
        await clientOperations.add({
          name: formData.name,
          type: formData.type,
          phone: formData.phone,
          address: formData.address,
          email: formData.email,
          credit: parseFloat(formData.credit) || 0,
          balance: 0,
          totalPurchases: 0,
          description: formData.description,
        });
      }
      setShowAddModal(false);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('保存客户失败:', error);
      alert('保存失败，请重试');
    }
  };

  // 编辑客户
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      type: client.type,
      phone: client.phone,
      address: client.address,
      email: client.email,
      credit: client.credit?.toString() || '0',
      description: client.description,
    });
    setShowAddModal(true);
  };

  // 删除客户
  const handleDelete = async (id: string) => {
    try {
      await clientOperations.delete(id);
      loadClients();
    } catch (error) {
      console.error('删除客户失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 获取客户类型标签颜色
  const getTypeBadgeType = (type: string): 'primary' | 'success' | 'warning' | 'default' => {
    switch (type) {
      case 'wholesale': return 'success';
      case 'hospital': return 'primary';
      case 'clinic': return 'warning';
      default: return 'default';
    }
  };

  // 获取客户类型显示文本
  const getTypeLabel = (type: string): string => {
    const found = clientTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  // 渲染客户项
  const renderClientItem = ({ item }: { item: Client }) => {
    return (
      <Card style={styles.clientCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ClientDetail' as never, { id: item.id } as never)}
        >
          <View style={styles.clientHeader}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{item.name}</Text>
              <View style={styles.clientTypeContainer}>
                <Badge text={getTypeLabel(item.type)} type={getTypeBadgeType(item.type)} />
              </View>
            </View>
          </View>

          <View style={styles.clientDetails}>
            {item.phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📞</Text>
                <Text style={styles.detailText}>{formatPhone(item.phone)}</Text>
              </View>
            )}
            {item.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <Text style={styles.detailText}>{item.address}</Text>
              </View>
            )}
          </View>

          <View style={styles.clientStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatMoney(item.totalPurchases || 0)}</Text>
              <Text style={styles.statLabel}>累计消费</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatMoney(item.credit || 0)}</Text>
              <Text style={styles.statLabel}>信用额度</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, (item.balance || 0) < 0 && styles.negativeBalance]}>
                {formatMoney(item.balance || 0)}
              </Text>
              <Text style={styles.statLabel}>账户余额</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.clientActions}>
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
    loadClients();
  }, []);

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchKeyword}
          onChangeText={handleSearch}
          placeholder="搜索客户名称、电话"
        />
      </View>

      {/* 客户列表 */}
      <FlatList
        data={clients}
        renderItem={renderClientItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Empty
            message="暂无客户"
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
        title={editingClient ? '编辑客户' : '添加客户'}
      >
        <View style={styles.formContainer}>
          <Input
            label="客户名称 *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="请输入客户名称"
          />

          {/* 客户类型选择 */}
          <View style={styles.formField}>
            <Text style={styles.inputLabel}>客户类型</Text>
            <View style={styles.typeSelector}>
              {clientTypes.map((type) => (
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

          <Input
            label="联系电话"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="请输入联系电话"
            keyboardType="phone-pad"
          />
          <Input
            label="地址"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="请输入地址"
          />
          <Input
            label="邮箱"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="请输入邮箱"
            keyboardType="email-address"
          />
          <Input
            label="信用额度"
            value={formData.credit}
            onChangeText={(text) => setFormData({ ...formData, credit: text })}
            placeholder="请输入信用额度"
            keyboardType="numeric"
          />
          <Input
            label="备注"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="请输入备注"
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
  clientCard: {
    marginBottom: theme.spacing.md,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  clientTypeContainer: {
    marginTop: theme.spacing.xs,
  },
  clientDetails: {
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  clientStats: {
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
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  negativeBalance: {
    color: theme.colors.error,
  },
  clientActions: {
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
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
