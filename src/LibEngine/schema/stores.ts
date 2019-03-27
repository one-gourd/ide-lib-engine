import {
  cast,
  types,
  Instance,
  SnapshotOrInstance,
  IAnyModelType
} from 'mobx-state-tree';
import {
  TAnyMSTModel,
  IStoresEnv,
  getSubAppsFromFactoryMap
} from 'ide-lib-base-component';

import { createEmptyModel } from './util';

// 定义子 facotry 映射关系
export const FACTORY_SUBAPP: Record<
  string,
  (...args: any[]) => Partial<IStoresEnv<TAnyMSTModel>>
> = {};

const cachedStoresMap = new Map<string, IAnyModelType>();

let autoId = 1;

export type TSubAppCreator = Record<
  string,
  (...args: any[]) => Partial<IStoresEnv<TAnyMSTModel>>
>;

export interface IGeneralStores {
  id: string;
  model: IAnyModelType;
  [propName: string]: any;
}

function getPrefix(idPrefix: string) {
  return `${idPrefix || 'unset'}_`;
}

export function createStores(ComponentModel: IAnyModelType, idPrefix: string) {
  return types
    .model('StoresModel', {
      id: types.refinement(
        types.identifier,
        (identifier: string) => identifier.indexOf(getPrefix(idPrefix)) === 0
      ),
      model: ComponentModel
    })
    .actions(self => {
      return {
        setModel(model: SnapshotOrInstance<typeof self.model>) {
          self.model = cast(model);
        },
        resetToEmpty() {
          self.model = createEmptyModel(ComponentModel);
        }
      };
    });
}

export type TStoresModel = ReturnType<typeof createStores>;
export interface IStoresModel extends Instance<TStoresModel> {}

/**
 * 工厂方法，传入 model 创建 stores，同时注入对应子元素的 client 和 app,
 * 使用缓存方式，防止重复创建
 */
export function StoresFactory(
  ComponentModel: IAnyModelType,
  subAppFactories: TSubAppCreator,
  idPrefix: string
) {
  const { subStores, subApps, subClients } = getSubAppsFromFactoryMap(
    subAppFactories || {}
  );

  const Stores = createStores(ComponentModel, idPrefix);

  // see: https://github.com/mobxjs/mobx-state-tree#dependency-injection
  // 依赖注入，方便在 controller 中可以直接调用子组件的 controller
  const stores = Stores.create(
    {
      id: `${getPrefix(idPrefix)}${autoId++}`,
      model: createEmptyModel(ComponentModel),
      ...(subStores as Record<string, TAnyMSTModel>)
    },
    {
      clients: subClients
    }
  );

  return {
    stores,
    innerApps: subApps
  };
}
