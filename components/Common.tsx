/**
 * 药品管理系统 - 通用UI组件
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../utils/theme';

// ==================== Button 组件 ====================

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'primary': return theme.colors.primary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return theme.fontSize.sm;
      case 'medium': return theme.fontSize.md;
      case 'large': return theme.fontSize.lg;
      default: return theme.fontSize.md;
    }
  };

  const getPaddingVertical = () => {
    switch (size) {
      case 'small': return 6;
      case 'medium': return 10;
      case 'large': return 14;
      default: return 10;
    }
  };

  const getPaddingHorizontal = () => {
    switch (size) {
      case 'small': return 12;
      case 'medium': return 20;
      case 'large': return 28;
      default: return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: getPaddingVertical(),
          paddingHorizontal: getPaddingHorizontal(),
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={[styles.buttonText, { fontSize: getFontSize() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ==================== Card 组件 ====================

interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </Wrapper>
  );
};

// ==================== Input 组件 ====================

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  style?: any;
  editable?: true;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  style,
  editable = true,
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textPlaceholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        editable={editable}
      />
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
};

// ==================== Modal 组件 ====================

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={showCloseButton ? onClose : undefined}
        activeOpacity={1}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={styles.modalBody}>{children}</ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ==================== List 组件 ====================

interface ListItemProps {
  title: string;
  subtitle?: string;
  rightText?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  showArrow?: boolean;
  danger?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  rightText,
  onPress,
  icon,
  showArrow = true,
  danger = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.listItemLeft}>
        {icon && <View style={styles.listItemIcon}>{icon}</View>}
        <View>
          <Text style={[styles.listItemTitle, danger && styles.listItemTitleDanger]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.listItemRight}>
        {rightText && (
          <Text style={styles.listItemRightText}>{rightText}</Text>
        )}
        {showArrow && onPress && (
          <Text style={styles.listItemArrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ==================== Empty 组件 ====================

interface EmptyProps {
  message?: string;
  onRefresh?: () => void;
  refreshText?: string;
}

export const Empty: React.FC<EmptyProps> = ({
  message = '暂无数据',
  onRefresh,
  refreshText = '刷新',
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message}</Text>
      {onRefresh && (
        <Button
          title={refreshText}
          onPress={onRefresh}
          type="primary"
          size="small"
          style={{ marginTop: theme.spacing.md }}
        />
      )}
    </View>
  );
};

// ==================== Badge 组件 ====================

interface BadgeProps {
  text: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ text, type = 'default' }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'primary': return theme.colors.primary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'danger': return theme.colors.error;
      default: return theme.colors.textPlaceholder;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
};

// ==================== Tag 组件 ====================

interface TagProps {
  text: string;
  color?: string;
  closable?: boolean;
  onClose?: () => void;
}

export const Tag: React.FC<TagProps> = ({ text, color, closable, onClose }) => {
  return (
    <View style={[styles.tag, { backgroundColor: color || theme.colors.primaryLight }]}>
      <Text style={styles.tagText}>{text}</Text>
      {closable && (
        <TouchableOpacity onPress={onClose} style={styles.tagClose}>
          <Text style={styles.tagCloseText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ==================== Loading 组件 ====================

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ text, fullScreen = false }) => {
  const content = (
    <View style={[styles.loadingContainer, fullScreen && styles.loadingFullScreen]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {text && <Text style={styles.loadingText}>{text}</Text>}
    </View>
  );

  return fullScreen ? content : content;
};

// ==================== Alert 组件 ====================

interface AlertProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ message, type = 'info', onClose }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#f6ffed';
      case 'warning': return '#fffbe6';
      case 'error': return '#fff2f0';
      default: return '#e6f7ff';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.primary;
    }
  };

  return (
    <View style={[styles.alert, { backgroundColor: getBackgroundColor() }]}>
      <Text style={[styles.alertText, { color: getTextColor() }]}>{message}</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.alertClose}>
          <Text style={{ color: getTextColor() }}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ==================== SearchBar 组件 ====================

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = '搜索',
  onSubmit,
}) => {
  return (
    <View style={styles.searchBar}>
      <Text style={styles.searchBarIcon}>🔍</Text>
      <TextInput
        style={styles.searchBarInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textPlaceholder}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.searchBarClear}
        >
          <Text style={styles.searchBarClearText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ==================== 样式定义 ====================

const styles = StyleSheet.create({
  // Button styles
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#fff',
    fontWeight: theme.fontWeight.medium,
  },

  // Card styles
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadow.medium,
  },

  // Input styles
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.card,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textDisabled,
  },
  inputErrorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.modal,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
  },
  modalBody: {
    padding: theme.spacing.md,
  },

  // List styles
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemIcon: {
    marginRight: theme.spacing.sm,
  },
  listItemTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  listItemTitleDanger: {
    color: theme.colors.error,
  },
  listItemSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemRightText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  listItemArrow: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textPlaceholder,
  },

  // Empty styles
  emptyContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPlaceholder,
  },

  // Badge styles
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    color: '#fff',
  },

  // Tag styles
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: theme.fontSize.xs,
    color: '#fff',
  },
  tagClose: {
    marginLeft: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagCloseText: {
    fontSize: 14,
    color: '#fff',
  },

  // Loading styles
  loadingContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingFullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },

  // Alert styles
  alert: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  alertText: {
    flex: 1,
    fontSize: theme.fontSize.md,
  },
  alertClose: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },

  // SearchBar styles
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    ...theme.shadow.small,
  },
  searchBarIcon: {
    marginRight: theme.spacing.sm,
    fontSize: 16,
  },
  searchBarInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  searchBarClear: {
    padding: theme.spacing.xs,
  },
  searchBarClearText: {
    fontSize: 18,
    color: theme.colors.textPlaceholder,
  },
});
