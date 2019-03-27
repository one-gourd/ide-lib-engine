import { types, Instance, IAnyType, IAnyModelType } from 'mobx-state-tree';

import { pick, capitalize } from 'ide-lib-utils';
import {
  BaseModel,
  TAnyFunction,
  IAnyModelInstance
} from 'ide-lib-base-component';

import { updateModelAttribute } from './util';
import { debugModel } from '../../lib/debug';

const createSetMethods = function(
  modelInstance: IAnyModelInstance,
  modelProps: Record<string, IAnyType>
) {
  const result: Record<string, TAnyFunction> = {};
  for (const propName in modelProps) {
    if (modelProps.hasOwnProperty(propName)) {
      const prop = modelProps[propName as keyof typeof modelProps];
      const typeName = prop.name;
      const fnName = `set${capitalize(propName)}`;
      if (typeName === 'string') {
        result[fnName] = function name(val: string) {
          modelInstance[propName] = val;
        };
      } else if (typeName === 'boolean') {
        result[fnName] = function name(val: string | boolean) {
          modelInstance[propName] = val === 'true' || val === true;
        };
      }
    }
  }
  return result;
};

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
