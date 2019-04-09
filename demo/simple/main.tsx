import { Instance } from 'mobx-state-tree';
import { initSuits } from '../../src';

export * from './config';
export * from '.';

import { LibEngineCurrying } from '.';
import { configLibEngine } from './config';

// TODO: 新增 initSuitsFromConfig 方法，简化用户配置
const {
  ComponentModel: LibEngineModel,
  NormalComponent: LibEngine,
  ComponentHOC: LibEngineHOC,
  ComponentAddStore: LibEngineAddStore,
  ComponentFactory: LibEngineFactory
} = initSuits({
  ComponentCurrying: LibEngineCurrying,
  className: configLibEngine.component.className,
  solution: configLibEngine.component.solution,
  defaultProps: configLibEngine.component.defaultProps,
  subComponents: configLibEngine.component.children,
  controlledKeys: configLibEngine.model.controlledKeys,
  modelProps: configLibEngine.model.props,
  modelExtends: configLibEngine.model.extends,
  subFactoryMap: {},
  subStoresModelMap: {},
  idPrefix: configLibEngine.store.idPrefix,
  routerConfig: configLibEngine.router
});

export {
  LibEngineModel,
  LibEngine,
  LibEngineHOC,
  LibEngineAddStore,
  LibEngineFactory
};

export interface ILibEngineModel extends Instance<typeof LibEngineModel> {}
