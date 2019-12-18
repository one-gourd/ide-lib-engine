import {
  onSnapshot,
  onPatch,
  onAction,
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

import { Debug } from 'ide-lib-utils';

import { createEmptyModel } from './util';

import { TSubFactoryMap } from '../component';

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

export const cachedStoresMap = new Map<
  string,
  {
    store: TStoresModel;
    autoId: number;
  }
>();

/**
 *  获取 Stores 对象
 *  不存在则新建，否则从缓存中获取
 * （提高性能，如果是相同的 Model，不需要重复创建 Stores 对象）
 * @export
 * @param {IAnyModelType} ComponentModel - 模型
 * @param {string} idPrefix - storeId
 * @param {Record<string, TAnyMSTModel>} subStoresModelMap - 子 stores map 对象
 * @returns
 */
export function getStoresModelCache(
  ComponentModel: IAnyModelType,
  idPrefix: string,
  subStoresModelMap: Record<string, TAnyMSTModel>
) {
  const cached = cachedStoresMap.get(ComponentModel.name) || {
    store: createStores(ComponentModel, idPrefix, subStoresModelMap),
    autoId: 0
  };

  cached.autoId = cached.autoId + 1;
  cachedStoresMap.set(ComponentModel.name, cached); // 更新缓存

  return cached;
}

/**
 * 工厂方法，传入 model 创建 stores，同时注入对应子元素的 client 和 app,
 * 使用缓存方式，防止重复创建
 */
export function StoresFactory<ISubProps>(
  ComponentModel: IAnyModelType,
  idPrefix: string,
  subAppFactoryMap: TSubFactoryMap<ISubProps>,
  subStoresModelMap: Record<string, TAnyMSTModel>
) {
  const { subStores, subApps, subClients } = getSubAppsFromFactoryMap(
    subAppFactoryMap || {}
  );

  const { store: Stores, autoId } = getStoresModelCache(
    ComponentModel,
    idPrefix,
    subStoresModelMap
  );

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

  /* ----------------------------------------------------
    用于 debug 时观察 stores 的变更, 通过 DEBUG = stores 开启
  ----------------------------------------------------- */
  if (Debug.enabled('stores')) {
    // 监听 stores 的变化，方便调试
    const consoleStyle = (color: string = '#bada55') =>
      `background: #444; color: ${color}; padding: 1px; border-radius:2px`;
    onSnapshot(stores, newSnapshot => {
      console.log('%c[Stores]Got new state: %O', consoleStyle(), newSnapshot);
    });

    onPatch(stores, patch => {
      console.log('%c[Stores]Got change: %O', consoleStyle('#F4E55A'), patch);
    });

    onAction(stores, call => {
      console.log(
        '%c[Stores]Action was called:  %O',
        consoleStyle('#F48D33'),
        call
      );
    });
  }

  return {
    stores,
    innerApps: subApps
  };
}
