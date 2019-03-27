import { Instance, IAnyModelType, IAnyType } from 'mobx-state-tree';

import { pick, capitalize } from 'ide-lib-utils';
import {
  BaseModel,
  TAnyFunction,
  IAnyModelInstance
} from 'ide-lib-base-component';

import { updateModelAttribute } from './util';

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
          modelInstance[propName] = val;
        };
      }
    }
  }
  return result;
};

export const createModelFromConfig: (
  className: string,
  modelProps: Record<string, IAnyType>,
  controlledKeys: string | string[]
) => IAnyModelType = (className, modelProps, controlledKeys) => {
  return BaseModel.named(`${className}Model`)
    .props(modelProps)
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
          return updateModelAttribute(self, name, value);
        }
      };
    });
};
