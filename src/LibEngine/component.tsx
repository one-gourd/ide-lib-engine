import React from 'react';
import Router from 'ette-router';
import { IAnyModelType, IAnyType } from 'mobx-state-tree';
import { observer } from 'mobx-react-lite';
import { pick } from 'ide-lib-utils';
import {
  based,
  Omit,
  useInjectedEvents,
  addModelChangeListener,
  TAnyFunction
} from 'ide-lib-base-component';

import { debugRender } from '../lib/debug';
import { createApp } from './controller/index';
import { StoresFactory, TSubAppCreator } from './schema/stores';
import { createModelFromConfig } from './schema/index';
let modelId = 1;

/* ----------------------------------------------------
    以下是专门配合 store 时的组件版本
----------------------------------------------------- */

/**
 * 生成 env 对象，方便在不同的状态组件中传递上下文
 */
export const createStoresEnv = (
  ComponentModel: IAnyModelType,
  subAppCreators: TSubAppCreator,
  routers: Router[],
  idPrefix: string
) => {
  const { stores, innerApps } = StoresFactory(
    ComponentModel,
    subAppCreators,
    idPrefix
  ); // 创建 stores
  const app = createApp(stores, routers, innerApps); // 创建 controller，并挂载 model
  return {
    stores,
    app,
    client: app.client,
    innerApps: innerApps
  };
};

// 用户自定义的组件，必须有 subComponents 这个入参 Props
export type TComponentCurrying<Props, ISubComponents> = (
  subComponents: ISubComponents
) => React.FunctionComponent<Props>;

/**
 * 使用高阶组件打造的组件生成器
 * @param subComponents - 子组件列表
 */
const createComponentHOC: <Props, ISubComponents>(
  ComponentCurrying: TComponentCurrying<Props, ISubComponents>,
  className: string,
  defaultProps: Props
) => (subComponents: ISubComponents) => React.FunctionComponent<Props> = (
  ComponentCurrying,
  className,
  defaultProps
) => subComponents => {
  const ResultComponent = ComponentCurrying(subComponents);
  ResultComponent.displayName = `${className}HOC`;
  return observer(based(observer(ResultComponent), defaultProps));
};

export interface ISuitsConfig<Props, ISubComponents> {
  ComponentCurrying: TComponentCurrying<Props, ISubComponents>;
  className: string;
  solution: Record<string, TAnyFunction[]>;
  defaultProps: Props;
  idPrefix: string;
  subsConfig: {
    normal: ISubComponents;
    addStore: ISubComponents;
  };
  modelProps: Record<string, IAnyType>;
  controlledKeys: string[];
  subAppCreators: TSubAppCreator;
  routers: Router[];
}

/**
 * 科里化创建 ComponentWithStore 组件
 * @param stores - store 模型实例
 */
export const initSuits = <Props, ISubComponents>(
  suitConfig: ISuitsConfig<Props, ISubComponents>
) => {
  const {
    ComponentCurrying,
    className,
    defaultProps,
    subsConfig,
    controlledKeys,
    modelProps,
    solution,
    idPrefix,
    routers,
    subAppCreators
  } = suitConfig;
  // 创建普通的函数

  // 创建 ComponentHOC
  const ComponentHOC = createComponentHOC(
    ComponentCurrying,
    className,
    defaultProps
  );

  const NormalComponent = ComponentHOC(subsConfig.normal);
  NormalComponent.displayName = `${className}`;

  // 创建 ComponentAddStore
  const ComponentAddStore: (
    storesEnv: any
  ) => React.FunctionComponent<typeof defaultProps> = storesEnv => {
    const { stores } = storesEnv;
    const ComponentHasSubStore = ComponentHOC(subsConfig.addStore);

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
      subAppCreators,
      routers,
      idPrefix
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
