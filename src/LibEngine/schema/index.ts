import {
  types,
  cast,
  IAnyType,
  IAnyModelType,
} from 'mobx-state-tree';

import { pick, capitalize, invariant } from 'ide-lib-utils';
import {
  BaseModel,
  TAnyFunction,
  IAnyModelInstance,
  NAME_JSON_MODEL
} from 'ide-lib-base-component';

import { updateModelAttribute } from './util';
import { debugModel } from '../../lib/debug';

const SPECIAL_PROP = [NAME_JSON_MODEL];

/* ----------------------------------------------------
    属性名转换
----------------------------------------------------- */
function nameMapper(typeName: string, propName: string) {
  if (!!~SPECIAL_PROP.indexOf(typeName)) {
    return `_${propName}`;
  }

  return propName;
}
/**
 * 转换属性名
 * 对于 JSONModel 等特殊类型，属性名需要更改（一般是添加 `_` 前缀）
 * 比如 `formData` 是 JSONModel 类型，那么生成的 mst 模型属性使用 `_formData`
 * 这样是为了方便生成 `get fromData(){}` 方法，让调用方比较方便
 *
 * @param {Record<string, IAnyType>} modelProps
 * @returns
 */
export function convertProps(modelProps: Record<string, IAnyType>) {
  const result: Record<string, IAnyType> = {};
  for (const propName in modelProps) {
    if (modelProps.hasOwnProperty(propName)) {
      const prop = modelProps[propName as keyof typeof modelProps];
      const typeName = prop.name;

      // 如果没有匹配到转换函数，则使用官方的 cast 方法
      const convertedPropName = nameMapper(typeName, propName);
      result[convertedPropName] = prop;
    }
  }
  return result;
}

/* ----------------------------------------------------
    getter 方法生成
----------------------------------------------------- */
const getterDescriptorMapper: Record<
  string,
  (
    modelInstance: IAnyModelInstance,
    propName: string
  ) => TypedPropertyDescriptor<any>
> = {};
getterDescriptorMapper[NAME_JSON_MODEL] = function(
  modelInstance: IAnyModelInstance,
  propName: string
) {
  return {
    get: function() {
      return modelInstance[`_${propName}`].value;
    }
  };
};

/**
 * 根据 model props 自动创建对于的 getter 方法
 * 比如 `props` 中有 `formData` 属性，如果该属性是 JSON Model，则会自动创建出 `get formData(){}` 的 getter
 * （对应的 model 属性则是 `_formData`）
 *
 *
 * @param {IAnyModelInstance} modelInstance - mst 实例
 * @param {Record<string, IAnyType>} modelProps - props 对象
 * @returns
 */
export function createGetterMethods(
  modelInstance: IAnyModelInstance,
  modelProps: Record<string, IAnyType>
) {
  const result: Record<string, TAnyFunction> = {};
  for (const propName in modelProps) {
    if (modelProps.hasOwnProperty(propName)) {
      const prop = modelProps[propName as keyof typeof modelProps];
      const typeName = prop.name;

      // 存在特殊 prop 类型时，需要定义特定的 view 视图
      if (
        !!~SPECIAL_PROP.indexOf(typeName) &&
        getterDescriptorMapper[typeName]
      ) {
        // 注意不能仅使用 `defineProperty`，不然 mobx.getMembers(mst) 是看不到你定义的属性出现在 views 属性中的
        // 需要先用 undefined 进行占位
        result[propName] = void 0;
        Object.defineProperty(
          result,
          propName,
          getterDescriptorMapper[typeName](modelInstance, propName)
        );
      }
    }
  }
  return result;
}

/* ----------------------------------------------------
    setter 方法生成
----------------------------------------------------- */
/**
 * 类型转换函数，简化 mst 的赋值操作
 */
const normalSetterMapper: Record<string, (val: any) => any> = {
  integer: (val: any) => {
    return parseInt(val);
  },
  number: (val: any) => {
    return parseFloat(val);
  },
  boolean: (val: any) => {
    return val === 'true' || val === true;
  },
  Date: (val: any) => {
    return new Date(val);
  }
};

// 特殊 setter 映射
const specialSetterMapper: Record<
  string,
  (modelInstance: IAnyModelInstance, propName: string) => (val: any) => any
> = {};

specialSetterMapper[NAME_JSON_MODEL] = (
  modelInstance: IAnyModelInstance,
  propName: string
) => (val: any) => {
  return modelInstance[`_${propName}`].setValue(val);
};

const getMappedSetter = function(
  typeName: string,
  modelInstance: IAnyModelInstance,
  propName: string
) {
  if (!!~SPECIAL_PROP.indexOf(typeName)) {
    invariant(
      !!specialSetterMapper[typeName],
      `必须要存在 ${typeName} 的 setter 映射函数`
    );
    return specialSetterMapper[typeName](modelInstance, propName);
  }

  const setterFn = normalSetterMapper[typeName] || cast;
  return function(val: any) {
    modelInstance[propName] = setterFn(val);
  };
};

/**
 * 根据 model props 自动创建对于的 setter 方法
 * 比如 `props` 中有 `visible` 属性，则会自动创建出 `setVisible` 的 setter
 *
 * @param {IAnyModelInstance} modelInstance
 * @param {Record<string, IAnyType>} modelProps
 * @returns
 */
function createSetterMethods(
  modelInstance: IAnyModelInstance,
  modelProps: Record<string, IAnyType>
) {
  const result: Record<string, TAnyFunction> = {};
  for (const propName in modelProps) {
    if (modelProps.hasOwnProperty(propName)) {
      const prop = modelProps[propName as keyof typeof modelProps];
      const typeName = prop.name;
      const fnName = `set${capitalize(propName)}`;

      // 匹配到转换函数
      result[fnName] = getMappedSetter(typeName, modelInstance, propName);
    }
  }
  return result;
}

/**
 * 根据配置项生成 mst 模型
 * 该功能是定制化的，专门用于 engine 系列组件的
 * @param className - 基础类名
 * @param modelProps - mst 属性定义
 * @param controlledKeys - 被 controlled 的属性
 * @param modelId - 模型 id
 */
export const createModelFromConfig: (
  className: string,
  modelProps: Record<string, IAnyType>,
  controlledKeys: string[],
  modelId: number
) => IAnyModelType = (className, modelProps, controlledKeys, modelId) => {
  // 如果是特殊的 props，需要特殊的转换
  const convertedModelProps = convertProps(modelProps);
  return BaseModel.named(`${className}Model${modelId}`)
    .props({
      id: types.refinement(
        types.identifier,
        (identifier: string) =>
          identifier.indexOf(`${className}Model${modelId}_`) === 0
      ),
      ...convertedModelProps
    })
    .views(self => {
      return createGetterMethods(self, modelProps);
    })
    .views(self => {
      return {
        /**
         * 只返回当前模型的属性，可以通过 filter 字符串进行属性项过滤
         */
        allAttibuteWithFilter(filterArray: string | string[] = controlledKeys) {
          const filters = [].concat(filterArray || []);
          return pick(self, filters);
        }
      };
    })
    .actions(self => {
      return createSetterMethods(self, modelProps);
    })
    .actions(self => {
      return {
        updateAttribute(name: string, value: any) {
          debugModel(
            `[updateAttribute] 将要更新 ${
              self.id
            } 中属性 ${name} 值为 ${value}; (control keys: ${controlledKeys})`
          );
          return updateModelAttribute(controlledKeys)(self, name, value);
        }
      };
    });
};

/**
 * 根据 props 定义快速生成 mst 模型
 * 该功能是通用型的，主要是为了简化 mst 模型的创建
 * @param modelName - 模型名
 * @param modelProps - mst 属性定义
 */
export const quickInitModel: (
  modelName: string,
  modelProps: Record<string, IAnyType>
) => IAnyModelType = (modelName, modelProps) => {
  const controlledKeys = Object.keys(modelProps);
  const convertedModelProps = convertProps(modelProps);
  return types
    .model(modelName, convertedModelProps)
    .views(self => {
      return createGetterMethods(self, modelProps);
    })
    .views(self => {
      return {
        /**
         * 只返回当前模型的属性，可以通过 filter 字符串进行属性项过滤
         */
        allAttibuteWithFilter(filterArray: string | string[] = controlledKeys) {
          const filters = [].concat(filterArray || []);
          return pick(self, filters);
        }
      };
    })
    .actions(self => {
      return createSetterMethods(self, modelProps);
    })
    .actions(self => {
      return {
        updateAttribute(name: string, value: any) {
          debugModel(
            `[updateAttribute] 将要更新 ${self.id ||
              modelName} 中属性 ${name} 值为 ${JSON.stringify(
              value
            )}; (control keys: ${controlledKeys})`
          );
          return updateModelAttribute(controlledKeys)(self, name, value);
        }
      };
    });
};
