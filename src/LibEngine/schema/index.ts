import { types, cast, IAnyType, IAnyModelType } from 'mobx-state-tree';

import { pick, capitalize } from 'ide-lib-utils';
import {
  BaseModel,
  TAnyFunction,
  IAnyModelInstance
} from 'ide-lib-base-component';

import { updateModelAttribute } from './util';
import { debugModel } from '../../lib/debug';

/**
 * 类型转换函数，简化 mst 的赋值操作
 */
const converterMap: Record<string, (val: any) => any> = {
  integer: function(val: any) {
    return parseInt(val);
  },
  number: function(val: any) {
    return parseFloat(val);
  },
  boolean: function(val: any) {
    return val === 'true' || val === true;
  },
  Date: function(val: any) {
    return new Date(val);
  }
};

const createSetMethods = function(
  modelInstance: IAnyModelInstance,
  modelProps: Record<string, IAnyType>
) {
  const result: Record<string, TAnyFunction> = {};
  for (const propName in modelProps) {
    if (modelProps.hasOwnProperty(propName)) {
      const prop = modelProps[propName as keyof typeof modelProps];
      const typeName = prop.name;
      console.log(444, typeName);
      const fnName = `set${capitalize(propName)}`;

      // 如果没有匹配到转换函数，则使用官方的 cast 方法
      const mappedConverted = converterMap[typeName] || cast;
      result[fnName] = function(val: string) {
        modelInstance[propName] = mappedConverted(val);
      };
    }
  }
  return result;
};

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
  return BaseModel.named(`${className}Model${modelId}`)
    .props({
      id: types.refinement(
        types.identifier,
        (identifier: string) =>
          identifier.indexOf(`${className}Model${modelId}_`) === 0
      ),
      ...modelProps
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
      return createSetMethods(self, modelProps);
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
  return types
    .model(modelName, modelProps)
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
      return createSetMethods(self, modelProps);
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
