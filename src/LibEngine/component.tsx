import React from 'react';
import Router from 'ette-router';
import { IAnyModelType, IAnyType } from 'mobx-state-tree';
import { observer } from 'mobx-react-lite';
import { pick, invariant } from 'ide-lib-utils';
import {
  based,
  Omit,
  useInjectedEvents,
  addModelChangeListener,
  TAnyFunction,
  IStoresEnv,
  extracSubEnv,
  TAnyMSTModel,
  IProxyRule
} from 'ide-lib-base-component';

import { debugRender } from '../lib/debug';
import { createApp } from './controller/index';
import { StoresFactory } from './schema/stores';
import { createModelFromConfig } from './schema/index';
import { IComponentConfig, TSubFactoryMap } from './interface';

let modelId = 1;

/* ----------------------------------------------------
    以下是专门配合 store 时的组件版本
----------------------------------------------------- */

/**
 * 生成 env 对象，方便在不同的状态组件中传递上下文
 */
export const createStoresEnv: <ISubProps>(
  ComponentModel: IAnyModelType,
  subFactoryMap: TSubFactoryMap<ISubProps>,
  subStoresModelMap: Record<keyof ISubProps, TAnyMSTModel>,
  routers: Router[],
  idPrefix: string,
  proxyRules: IProxyRule[]
) => IStoresEnv<TAnyMSTModel> = (
  ComponentModel,
  subFactoryMap,
  subStoresModelMap,
  routers,
  idPrefix,
  proxyRules
) => {
  const { stores, innerApps } = StoresFactory<typeof subStoresModelMap>(
    ComponentModel,
    idPrefix,
    subFactoryMap,
    subStoresModelMap
  ); // 创建 stores
  const app = createApp(stores, routers, innerApps, proxyRules); // 创建 controller，并挂载 model
  return {
    stores,
    app,
    client: app.client,
    innerApps: innerApps
  };
};

// 用户自定义的组件，必须有 subComponents 这个入参 Props
export type TComponentCurrying<Props, ISubProps> = (
  subComponents:
    | Record<keyof ISubProps, React.FunctionComponent<Props>>
    | Record<
        keyof ISubProps,
        (storesEnv: IStoresEnv<TAnyMSTModel>) => React.FunctionComponent<Props>
      >
) => React.FunctionComponent<Props>;

/**
 * 使用高阶组件打造的组件生成器
 * @param subComponents - 子组件列表
 */
const createComponentHOC: <Props, ISubProps>(
  ComponentCurrying: TComponentCurrying<Props, ISubProps>,
  className: string,
  defaultProps: Props
) => (
  subComponents:
    | Record<keyof ISubProps, React.FunctionComponent<Props>>
    | Record<
        keyof ISubProps,
        (storesEnv: IStoresEnv<TAnyMSTModel>) => React.FunctionComponent<Props>
      >
) => any = (ComponentCurrying, className, defaultProps) => subComponents => {
  const ResultComponent = ComponentCurrying(subComponents);
  ResultComponent.displayName = `${className}HOC`;
  return observer(based(observer(ResultComponent), defaultProps));
};

export interface ISuitsConfig<Props, ISubProps> {
  ComponentCurrying: TComponentCurrying<Props, ISubProps>;
  className: string;
  solution: Record<string, TAnyFunction[]>;
  defaultProps: Props;
  idPrefix: string;
  subComponents: Record<keyof ISubProps, IComponentConfig<Props, ISubProps>>;
  modelProps: Record<keyof ISubProps, IAnyType>;
  controlledKeys: string[];
  subFactoryMap: TSubFactoryMap<ISubProps>;
  subStoresModelMap: Record<keyof ISubProps, TAnyMSTModel>;
  routers: Router[];
}

/**
 * 科里化创建 ComponentWithStore 组件
 * TODO: 这里替换 any 返回值
 * @param stores - store 模型实例
 */
export const initSuits: <Props, ISubProps>(
  suitConfig: ISuitsConfig<Props, ISubProps>
) => any = suitConfig => {
  const {
    ComponentCurrying,
    className,
    defaultProps,
    subComponents,
    controlledKeys,
    modelProps,
    solution,
    idPrefix,
    routers,
    subFactoryMap,
    subStoresModelMap
  } = suitConfig;
  // 创建普通的函数

  // 创建 ComponentHOC
  const ComponentHOC = createComponentHOC(
    ComponentCurrying,
    className,
    defaultProps
  );

  // 构造 normal 组件集合
  const normalComponents = {} as any;
  const proxyRules: IProxyRule[] = [];

  // 装备组件集合、路由规则
  Object.values(subComponents).map(
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
        targets: [].concat(subComponent.routerProxy || [])
      });
    }
  );

  const NormalComponent = ComponentHOC(normalComponents);
  NormalComponent.displayName = `${className}`;

  // 创建 ComponentAddStore
  const ComponentAddStore: (
    storesEnv: any
  ) => React.FunctionComponent<typeof defaultProps> = storesEnv => {
    const { stores } = storesEnv;

    const addStoreComponents = {} as any;

    Object.values(subComponents).map(
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
          {...otherPropsWithInjected}
        />
      );
    };

    ComponentWithStore.displayName = `${className}WithStore`;
    return observer(ComponentWithStore);
  };

  // 创建 LibEngine 数据模型
  const ComponentModel = createModelFromConfig(
    className,
    modelProps,
    controlledKeys,
    modelId++
  );

  // 给 model 随身带上 _defaultProps 属性，让初始化 model 的时候，view 和 model 数据保持一致
  // 否则默认创建的 model 中的 `style`、`theme` 属性都是空对象
  (ComponentModel as any)['_defaultProps'] = defaultProps;

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
      proxyRules
    );
    return {
      ...storesEnv,
      ComponentWithStore: ComponentAddStore(storesEnv)
    };
  };

  return {
    ComponentModel,
    NormalComponent,
    ComponentHOC,
    ComponentAddStore,
    ComponentFactory
  };
};
