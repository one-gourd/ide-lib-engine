import {
  updateInScope,
  BASE_CONTROLLED_KEYS,
  IBaseComponentProps,
  IAnyModelInstance
} from 'ide-lib-base-component';

import { capitalize } from 'ide-lib-utils';

import { IAnyModelType } from 'mobx-state-tree';

let mId = 1;
/**
 * 将普通对象转换成 Model
 * @param modelObject - 普通的对象
 */
export function createModel<Props extends IBaseComponentProps>(
  ComponentModel: IAnyModelType,
  modelObject: Props,
  // 使用 `_defaultProps` 对象，让 model 和 view 数据保持一致
  defaultProps: Props = (ComponentModel as any)['_defaultProps']
): IAnyModelInstance {
  const mergedProps = Object.assign({}, defaultProps || {}, modelObject);
  const { theme, styles, ...otherProps } = mergedProps;

  const model = ComponentModel.create({
    id: `${ComponentModel.name}_${mId++}`,
    ...otherProps
  });
  model.setStyles(styles || {});
  model.setTheme(theme);

  // 解决 JSONModel 中默认值不一致的问题
  const otherControlledKeyMap = (ComponentModel as any)[
    '_otherControlledKeyMap'
  ];
  if (otherControlledKeyMap) {
    for (const subPropName in otherControlledKeyMap) {
      // 限定范围，在 otherProps 中
      if (
        otherControlledKeyMap.hasOwnProperty(subPropName) &&
        otherProps[subPropName]
      ) {
        model[`set${capitalize(subPropName)}`](otherProps[subPropName]);
        // console.log(999, model[subPropName].formData);
        // const otherKeys = otherControlledKeyMap[subPropName];
        // otherProps[subPropName] = pick(model[subPropName], otherKeys);
      }
    }
  }

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
