import React from 'react';
import Router from 'ette-router';
import { IAnyModelType, IAnyType } from 'mobx-state-tree';
import { observer } from 'mobx-react-lite';
import { pick, invariant, IMergeRule } from 'ide-lib-utils';
import {
  based,
  Omit,
  useInjectedEvents,
  addModelChangeListener,
  TAnyFunction,
  IStoresEnv,
  extracSubEnv,
  TAnyMSTModel,
  IProxyRule,
  IAliasRoute,
  IAliasRule,
  ValueOf,
  IBaseConfig,
  IBaseComponentProps
} from 'ide-lib-base-component';

import { debugRender } from '../lib/debug';
import { createApp } from './controller/index';
import { StoresFactory, getStoresModelCache } from './schema/stores';
import { createModelFromConfig } from './schema/index';

/* ----------------------------------------------------
    类型声明
----------------------------------------------------- */
export declare type TFactoryFunction = (
  ...args: any[]
) => Partial<IStoresEnv<TAnyMSTModel>>;

export declare type TSubFactoryMap<ISubMap> = Record<
  keyof ISubMap,
  TFactoryFunction
>;

export declare type TRecordObject<P extends string | number | symbol, T> = {
  [key1 in P]?: T
} & { [key: string]: any };

// type TProps<T> = T extends (infer U) ? U : any;
export declare interface IComponentConfig<Props, ISubMap> {
  className: string;
  solution?: TRecordObject<string, TAnyFunction[]>;
  defaultProps?: Props;
  mergeRule?: IMergeRule;
  children?: TRecordObject<
    keyof ISubMap,
    IComponentConfig<ValueOf<ISubMap>, any>
  >;
  storesModel?: TAnyMSTModel;
  factory?: TFactoryFunction;

  // 主要是用在 children 内的
  normal?: React.FunctionComponent<Props>;
  addStore?: (
    storesEnv: IStoresEnv<TAnyMSTModel>
  ) => React.FunctionComponent<Props>;
  namedAs?: string; // 属性名
  routeScope?: string[]; // 可以被父元素访问到的 route 名字
}
export declare interface IModuleConfig<Props, ISubMap> {
  component: IComponentConfig<Props, ISubMap>;
  router: {
    domain: string;
    list?: Router[];
    hoistRoutes?: IAliasRoute | IAliasRoute[]; // 提升访问子路由功能，相当于是强约束化的 alias
    aliases?: IAliasRule | IAliasRule[]; // 自定义的路由别名规则
  };

  store: {
    idPrefix: string;
  };
  model: {
    controlledKeys: string[];
    otherControlledKeyMap?: { [key: string]: string[] };
    props: TRecordObject<string, IAnyType>;
    extends?: (model: IAnyModelType) => IAnyModelType;
  };
}

// 用户自定义的组件，必须有 subComponents 这个入参 Props
export type TComponentCurrying<Props, ISubMap> = (
  subComponents:
    | Record<keyof ISubMap, React.FunctionComponent<Props>>
    | Record<
        keyof ISubMap,
        (storesEnv: IStoresEnv<TAnyMSTModel>) => React.FunctionComponent<Props>
      >
) => React.FunctionComponent<Props>;

export interface ISuitsConfig<Props, ISubMap> {
  ComponentCurrying: TComponentCurrying<Props, ISubMap>;
  className: string;
  solution: IComponentConfig<Props, ISubMap>['solution'];
  defaultProps: Props;
  mergeRule?: IMergeRule;
  idPrefix: string;
  subComponents: TRecordObject<keyof ISubMap, IComponentConfig<Props, ISubMap>>;
  modelProps: TRecordObject<string, IAnyType>;
  modelExtends?: (model: IAnyModelType) => IAnyModelType;
  controlledKeys: IModuleConfig<Props, ISubMap>['model']['controlledKeys'];
  otherControlledKeyMap?: IModuleConfig<
    Props,
    ISubMap
  >['model']['otherControlledKeyMap'];
  subFactoryMap: TSubFactoryMap<ISubMap>;
  subStoresModelMap: TRecordObject<keyof ISubMap, TAnyMSTModel>;
  routerConfig: IModuleConfig<Props, ISubMap>['router'];
}

// ===============================================

let modelId = 1;

/* ----------------------------------------------------
    以下是专门配合 store 时的组件版本
----------------------------------------------------- */

/**
 * 生成 env 对象，方便在不同的状态组件中传递上下文
 */
export const createStoresEnv: <ISubMap>(
  ComponentModel: IAnyModelType,
  subFactoryMap: TSubFactoryMap<ISubMap>,
  subStoresModelMap: Record<keyof ISubMap, TAnyMSTModel>,
  routers: Router[],
  idPrefix: string,
  proxyRules: IProxyRule[],
  aliasRoutes: IAliasRoute[],
  aliases: IAliasRule[],
  domain: string
) => IStoresEnv<TAnyMSTModel> = (
  ComponentModel,
  subFactoryMap,
  subStoresModelMap,
  routers,
  idPrefix,
  proxyRules,
  aliasRoutes,
  aliases,
  domain
) => {
  const { stores, innerApps } = StoresFactory<typeof subStoresModelMap>(
    ComponentModel,
    idPrefix,
    subFactoryMap,
    subStoresModelMap
  ); // 创建 stores 对象

  const app = createApp(
    stores,
    routers,
    innerApps,
    proxyRules,
    aliasRoutes,
    aliases,
    domain
  ); // 创建 controller，并挂载 model
  return {
    stores,
    app,
    client: app.client,
    innerApps: innerApps
  };
};

/**
 * 使用高阶组件打造的组件生成器
 * @param subComponents - 子组件列表
 */
const createComponentHOC: <Props, ISubMap>(
  ComponentCurrying: ISuitsConfig<Props, ISubMap>['ComponentCurrying'],
  className: string,
  defaultProps: Props,
  config: IBaseConfig
) => TComponentCurrying<any, ISubMap> = (
  ComponentCurrying,
  className,
  defaultProps,
  config = {}
) => subComponents => {
  const ResultComponent = ComponentCurrying(subComponents);
  ResultComponent.displayName = `${className}HOC`;
  return observer(based(observer(ResultComponent), defaultProps, config));
};

const DEFAULT_MODEL_EXTENDER = (model: IAnyModelType) => {
  return model;
};

/**
 * 科里化创建 ComponentWithStore 组件
 * TODO: 这里替换 any 返回值
 * @param stores - store 模型实例
 */
export const initSuits: <Props extends IBaseComponentProps, ISubMap>(
  suitConfig: ISuitsConfig<Props, ISubMap>
) => any = suitConfig => {
  const {
    ComponentCurrying,
    className,
    defaultProps,
    mergeRule = {},
    subComponents,
    controlledKeys,
    otherControlledKeyMap,
    modelProps,
    modelExtends = DEFAULT_MODEL_EXTENDER,
    solution,
    idPrefix,
    routerConfig,
    subFactoryMap,
    subStoresModelMap
  } = suitConfig;

  // 从 subComponents 中提取列表 keys 和 values
  const subComponentValues = Object.values(subComponents);
  const subComponentKeys = Object.keys(subComponents);

  // 创建 based config ，可以指定融合层级
  const basedConfig = {
    mergeRule
  };

  // 创建 ComponentHOC
  const ComponentHOC = createComponentHOC(
    ComponentCurrying,
    className,
    defaultProps,
    basedConfig
  );

  // 构造 normal 组件集合
  const normalComponents = {} as any;

  // 获取路由列表
  const routers = routerConfig.list || [];

  // 整理子元素的路由代理规则
  const proxyRules: IProxyRule[] = [];

  // 整理子路由提升规则和自定义路由规则
  const aliasRoutes: IAliasRoute[] = [].concat(routerConfig.hoistRoutes || []);
  // 为了统一管理，针对 alias 规则，全部放在 /alias 命名空间下
  const aliases: IAliasRule[] = []
    .concat(routerConfig.aliases || [])
    .map((rule: IAliasRule) => {
      return {
        alias: `/alias/${rule.alias}`,
        path: rule.path
      };
    });

  // 装备组件集合、路由规则
  subComponentValues.map(
    (
      subComponent: IComponentConfig<
        typeof defaultProps,
        keyof typeof subFactoryMap
      >
    ) => {
      invariant(
        !!subComponent.className,
        `[NormalComponent] ${
          subComponent.className
        } 配置项中缺少 'className' 字段，无法生成子组件和路由规则`
      );
      normalComponents[subComponent.className] = subComponent.normal;

      // 组装 proxyRules 路由规则
      proxyRules.push({
        name: subComponent.namedAs,
        targets: [].concat(subComponent.routeScope || [])
      });
    }
  );

  const NormalComponent = ComponentHOC(normalComponents);
  NormalComponent.displayName = `${className}`;

  // 创建 ComponentAddStore
  const ComponentAddStore: (
    storesEnv: any
  ) => React.FunctionComponent<
    Omit<typeof defaultProps, typeof controlledKeys>
  > = storesEnv => {
    const { stores } = storesEnv;

    const addStoreComponents = {} as any;

    subComponentValues.map(
      (
        subComponent: IComponentConfig<
          typeof defaultProps,
          keyof typeof subFactoryMap
        >
      ) => {
        invariant(
          !!subComponent.namedAs,
          `[ComponentAddStore] ${
            subComponent.className
          } 配置项中缺少 'namedAs' 字段，无法生成带 Store 状态的组件`
        );
        addStoreComponents[subComponent.className] = subComponent.addStore(
          extracSubEnv(storesEnv, subComponent.namedAs)
        );
      }
    );

    const ComponentHasSubStore = ComponentHOC(addStoreComponents);

    // 创建 ComponentWithStore
    const ComponentWithStore = (
      props: Omit<typeof defaultProps, typeof controlledKeys>
    ) => {
      const { ...otherProps } = props;
      const { model } = stores as any;
      const controlledProps = pick(model, controlledKeys);
      debugRender(`[${(stores as any).id}] rendering`);

      // 对 controlledProps 再进行一层 model pick
      // 比如对 propsEditor: {_schema: JSONModel} 指定提取 `schema` 字段
      if (otherControlledKeyMap) {
        for (const subPropName in otherControlledKeyMap) {
          // 限定范围，在 controlledProps 中
          if (
            otherControlledKeyMap.hasOwnProperty(subPropName) &&
            controlledProps[subPropName]
          ) {
            const otherKeys = otherControlledKeyMap[subPropName];
            controlledProps[subPropName] = pick(model[subPropName], otherKeys);
          }
        }
      }

      /* ----------------------------------------------------
          note: 对子组件也进行 injectedEvents 操作
      ----------------------------------------------------- */
      const subComponentInjected: {
        [key: string]: TRecordObject<string, TAnyFunction[]>;
      } = {};
      subComponentValues.forEach(
        (
          subComponent: IComponentConfig<
            typeof defaultProps,
            keyof typeof subFactoryMap
          >
        ) => {
          invariant(
            !!subComponent.namedAs,
            `[ComponentWithStore] ${
              subComponent.className
            } 配置项中缺少 'namedAs' 字段，无法通过 useInjectedEvents 给组件注入 solution`
          );
          const subSolutions = subComponent.solution;
          if (!!subSolutions) {
            const subProps = props[subComponent.namedAs] || {};
            const subPropsWithInjected = useInjectedEvents<
              typeof subProps,
              typeof subComponent.storesModel
            >(storesEnv, subProps, subSolutions || {});
            subComponentInjected[subComponent.namedAs] = subPropsWithInjected;
          }
        }
      );
      // =========

      const otherPropsWithInjected = useInjectedEvents<
        typeof props,
        typeof stores
      >(storesEnv, otherProps, solution || {});

      addModelChangeListener(
        model,
        controlledKeys,
        otherPropsWithInjected.onModelChange
      );

      return (
        <ComponentHasSubStore
        {...controlledProps}
        {...otherPropsWithInjected} // 其他属性高，表明用于指定传入的属性优先级要高于 store 控制的
        {...subComponentInjected} // 其他子组件属性功能优先级更高
        />
      );
    };

    ComponentWithStore.displayName = `${className}WithStore`;
    return observer(ComponentWithStore);
  };

  // 创建 LibEngine 数据模型（扩展 ComponentModel）
  const ComponentModel = modelExtends(
    createModelFromConfig(className, modelProps, controlledKeys, modelId++) // 基础 Model
  );

  // 给 model 随身带上 _defaultProps 属性，让初始化 model 的时候，view 和 model 数据保持一致
  // 否则默认创建的 model 中的 `style`、`theme` 属性都是空对象
  (ComponentModel as any)['_defaultProps'] = defaultProps;
  // 解决模型中的 JSONModel 的初始化为空对象的问题
  (ComponentModel as any)['_otherControlledKeyMap'] = otherControlledKeyMap;

  /**
   * 工厂函数，每调用一次就获取一副 MVC
   * 用于隔离不同的 ComponentWithStore 的上下文
   */
  const ComponentFactory = () => {
    const storesEnv = createStoresEnv(
      ComponentModel,
      subFactoryMap,
      subStoresModelMap,
      routers,
      idPrefix,
      proxyRules,
      aliasRoutes,
      aliases,
      routerConfig.domain
    );
    return {
      ...storesEnv,
      ComponentWithStore: ComponentAddStore(storesEnv)
    };
  };

  // 同时获取对应的 StoresModel 对象
  const storesModelCache = getStoresModelCache(
    ComponentModel,
    idPrefix,
    subStoresModelMap
  );

  return {
    StoresModel: storesModelCache && storesModelCache.store,
    ComponentModel,
    NormalComponent,
    ComponentHOC,
    ComponentAddStore,
    ComponentFactory // 注意，只有外部调用该工厂函数后， `cachedStores` 才会有数据内容
  };
};

// ===========================

/**
 * 通过模块配置项，简化初始化方法调用
 * @param config - 模块配置项
 */
export function initSuitsFromConfig<Props, ISubMap>(
  ModuleCurrying: TComponentCurrying<Props, ISubMap>,
  moduleConfig: IModuleConfig<Props, ISubMap>
) {
  // 抽离子组件配置项
  const subComponents = moduleConfig.component.children;
  const subComponentNames = Object.keys(subComponents);
  const subStoresModelMap: TRecordObject<
    keyof typeof subComponents,
    TAnyMSTModel
  > = {};
  const subFactoryMap: TRecordObject<
    keyof typeof subComponents,
    TFactoryFunction
  > = {};
  subComponentNames.forEach((name: string) => {
    subStoresModelMap[name] = subComponents[name].storesModel;
    subFactoryMap[name] = subComponents[name].factory;
  });

  return initSuits({
    ComponentCurrying: ModuleCurrying,
    className: moduleConfig.component.className,
    solution: moduleConfig.component.solution,
    defaultProps: moduleConfig.component.defaultProps,
    mergeRule: moduleConfig.component.mergeRule,
    controlledKeys: moduleConfig.model.controlledKeys,
    otherControlledKeyMap: moduleConfig.model.otherControlledKeyMap,
    modelProps: moduleConfig.model.props,
    modelExtends: moduleConfig.model.extends,
    subComponents: moduleConfig.component.children,
    subStoresModelMap: subStoresModelMap,
    subFactoryMap: subFactoryMap,
    idPrefix: moduleConfig.store.idPrefix,
    routerConfig: moduleConfig.router
  });
}
