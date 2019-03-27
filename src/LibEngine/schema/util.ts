import {
  updateInScope,
  BASE_CONTROLLED_KEYS,
  IBaseComponentProps,
  IAnyModelInstance
} from 'ide-lib-base-component';

import { IAnyModelType } from 'mobx-state-tree';

/**
 * 将普通对象转换成 Model
 * @param modelObject - 普通的对象
 */
export function createModel<Props extends IBaseComponentProps>(
  ComponentModel: IAnyModelType,
  modelObject: Props,
  defaultProps?: Props
): IAnyModelInstance {
  const mergedProps = Object.assign({}, defaultProps || {}, modelObject);
  const { theme, styles, ...otherProps } = mergedProps;

  const model = ComponentModel.create(otherProps);
  model.setStyles(styles || {});
  model.setTheme(theme);

  return model;
}

/**
 * 创建新的空白
 */
export function createEmptyModel(ComponentModel: IAnyModelType) {
  return createModel(ComponentModel, {});
}

/* ----------------------------------------------------
    更新指定 enum 中的属性
----------------------------------------------------- */

// 定义 menu 可更新信息的属性

export const updateModelAttribute = (selfControlledKeys: string[]) => {
  const EDITABLE_ATTRIBUTE = BASE_CONTROLLED_KEYS.concat(selfControlledKeys);
  return updateInScope(EDITABLE_ATTRIBUTE);
};
