import { Instance } from 'mobx-state-tree';
import { initSuits } from '../../src';

export * from './config';
export * from '.';

import { HeaderBlockCurrying } from '.';
import { configHeaderBlock } from './config';

// 抽离子组件配置项
const subComponents = configHeaderBlock.component.children;
const subComponentNames = Object.keys(subComponents);
const subStoresModelMap = {};
const subFactoryMap = {};
subComponentNames.forEach((name: string) => {
  subStoresModelMap[name] = subComponents[name].storesModel;
  subFactoryMap[name] = subComponents[name].factory;
});

const {
  ComponentModel: HeaderBlockModel,
  NormalComponent: HeaderBlock,
  ComponentHOC: HeaderBlockHOC,
  ComponentAddStore: HeaderBlockAddStore,
  ComponentFactory: HeaderBlockFactory
} = initSuits({
  ComponentCurrying: HeaderBlockCurrying,
  className: configHeaderBlock.component.className,
  solution: configHeaderBlock.component.solution,
  defaultProps: configHeaderBlock.component.defaultProps,
  controlledKeys: configHeaderBlock.model.controlledKeys,
  modelProps: configHeaderBlock.model.props,
  subComponents: configHeaderBlock.component.children,
  subStoresModelMap: subStoresModelMap,
  subFactoryMap: subFactoryMap,
  idPrefix: configHeaderBlock.store.idPrefix,
  routerConfig: configHeaderBlock.router
});

export {
  HeaderBlockModel,
  HeaderBlock,
  HeaderBlockHOC,
  HeaderBlockAddStore,
  HeaderBlockFactory
};

export interface IHeaderBlockModel extends Instance<typeof HeaderBlockModel> {}
