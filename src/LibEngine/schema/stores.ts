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
  getSubAppsFromFactoryMap,
  getSubStoresAssigner
} from 'ide-lib-base-component';

import { createEmptyModel } from './util';

// 定义子 facotry 映射关系
export const FACTORY_SUBAPP: Record<
  string,
  (...args: any[]) => Partial<IStoresEnv<TAnyMSTModel>>
> = {};

export type TFactoryFunction = (
  ...args: any[]
) => Partial<IStoresEnv<TAnyMSTModel>>;

export type TSubFactoryMap = Record<string, TFactoryFunction>;

function getPrefix(idPrefix: string) {
  return `${idPrefix || 'unset'}_`;
}

export function createStores(
  ComponentModel: IAnyModelType,
  idPrefix: string,
  // TODO: 这里的 sub 里的 string，替换成 ESubNames 枚举值
  subStoresModelMap: Record<string, TAnyMSTModel> // 子 store Model 对象，不是 stores 实例
) {
  const subNames = Object.keys(subStoresModelMap); // 获取子名字

  // 根据是否有子子组件配置，决定是否将 subStoresModelMap 注入到 store props 中
  const storeProps = Object.assign(
    {},
    {
      id: types.refinement(
        types.identifier,
        (identifier: string) => identifier.indexOf(getPrefix(idPrefix)) === 0
      ),
      model: ComponentModel
    },
    subNames.length ? subStoresModelMap : {}
  );

  return types.model('StoresModel', storeProps).actions(self => {
    // 子 stores 的 assign 方法，比如 setSchemaTree 方法
    const assignerInjected = subNames.length
      ? getSubStoresAssigner(self, subNames)
      : {};
    return {
      setModel(model: SnapshotOrInstance<typeof self.model>) {
        self.model = cast(model);
      },
      ...assignerInjected,
      resetToEmpty() {
        self.model = createEmptyModel(ComponentModel);
      }
    };
  });
}

export type TStoresModel = ReturnType<typeof createStores>;
export interface IStoresModel extends Instance<TStoresModel> {}

const cachedStoresMap = new Map<
  string,
  {
    store: TStoresModel;
    autoId: number;
  }
>();

/**
 * 工厂方法，传入 model 创建 stores，同时注入对应子元素的 client 和 app,
 * 使用缓存方式，防止重复创建
 */
export function StoresFactory(
  ComponentModel: IAnyModelType,
  idPrefix: string,
  subAppFactoryMap: TSubFactoryMap,
  subStoresModelMap: Record<string, TAnyMSTModel>
) {
  const { subStores, subApps, subClients } = getSubAppsFromFactoryMap(
    subAppFactoryMap || {}
  );

  /* ----------------------------------------------------
    获取 Stores 对象
    不存在则新建，否则从缓存中获取
    （提高性能，如果是相同的 Model，不需要重复创建 Stores 对象）
----------------------------------------------------- */
  const cached = cachedStoresMap.get(ComponentModel.name) || {
    store: createStores(ComponentModel, idPrefix, subStoresModelMap),
    autoId: 0
  };

  cached.autoId = cached.autoId + 1;
  cachedStoresMap.set(ComponentModel.name, cached); // 更新缓存

  const { store: Stores, autoId } = cached;
  // =======================================

  // see: https://github.com/mobxjs/mobx-state-tree#dependency-injection
  // 依赖注入，方便在 controller 中可以直接调用子组件的 controller
  const stores = Stores.create(
    {
      id: `${getPrefix(idPrefix)}${autoId}`,
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
