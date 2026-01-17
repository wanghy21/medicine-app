/**
 * 药品管理系统 - 主题配置
 */

export const theme = {
  colors: {
    primary: '#1890ff',        // 主色调 - 蓝色
    primaryDark: '#096dd9',    // 深蓝色
    primaryLight: '#40a9ff',   // 浅蓝色
    success: '#52c41a',        // 成功 - 绿色
    warning: '#faad14',        // 警告 - 橙色
    error: '#ff4d4f',          // 错误 - 红色
    info: '#1890ff',           // 信息 - 蓝色

    // 背景色
    background: '#f5f5f5',     // 页面背景
    card: '#ffffff',           // 卡片背景
    modal: '#ffffff',          // 弹窗背景

    // 文字色
    textPrimary: '#333333',    // 主要文字
    textSecondary: '#666666',  // 次要文字
    textPlaceholder: '#999999', // 占位文字
    textDisabled: '#bfbfbf',   // 禁用文字

    // 边框色
    border: '#e8e8e8',
    borderLight: '#f0f0f0',

    // 渐变色
    gradientStart: '#1890ff',
    gradientEnd: '#52c41a',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },

  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },

  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },

  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

export type Theme = typeof theme;
