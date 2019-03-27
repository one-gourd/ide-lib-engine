import React from 'react';
import { IAnyModelType } from 'mobx-state-tree';
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

/* ----------------------------------------------------
    以下是专门配合 store 时的组件版本
----------------------------------------------------- */

/**
 * 生成 env 对象，方便在不同的状态组件中传递上下文
 */
export const createStoresEnv = (
  ComponentModel: IAnyModelType,
  subAppCreators: TSubAppCreator,
  idPrefix: string
) => {
  const { stores, innerApps } = StoresFactory(
    ComponentModel,
    subAppCreators,
    idPrefix
  ); // 创建 stores
  const app = createApp(stores, innerApps); // 创建 controller，并挂载 model
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
  subComponents: ISubComponents;
  controlledKeys: string[];
  ComponentModel: IAnyModelType;
  subAppCreators: TSubAppCreator;
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
    subComponents,
    controlledKeys,
    ComponentModel,
    solution,
    idPrefix,
    subAppCreators
  } = suitConfig;
  // 创建普通的函数
  const NormalComponent = ComponentCurrying(subComponents);
  NormalComponent.displayName = 'className';

  // 创建 ComponentHOC
  const ComponentHOC = createComponentHOC(
    ComponentCurrying,
    className,
    defaultProps
  );

  // 创建 ComponentAddStore
  const ComponentAddStore: (
    storesEnv: any
  ) => React.FunctionComponent<typeof defaultProps> = storesEnv => {
    const { stores } = storesEnv;
    const ComponentHasSubStore = ComponentHOC(subComponents);

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

  /**
   * 工厂函数，每调用一次就获取一副 MVC
   * 用于隔离不同的 ComponentWithStore 的上下文
   */
  const ComponentFactory = () => {
    const storesEnv = createStoresEnv(ComponentModel, subAppCreators, idPrefix);
    return {
      ...storesEnv,
      ComponentWithStore: ComponentAddStore(storesEnv)
    };
  };

  return {
    NormalComponent,
    ComponentHOC,
    ComponentAddStore,
    ComponentFactory
  };
};
