import { Instance } from 'mobx-state-tree';
import { initSuits } from '../../src';

export * from './config';
export * from '.';

import { LibEngineCurrying } from '.';
import { configLibEngine } from './config';

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
  subFactoryMap: {},
  subStoresModelMap:{},
  idPrefix: configLibEngine.store.idPrefix,
  routers: configLibEngine.routers.list
});

export {
  LibEngineModel,
  LibEngine,
  LibEngineHOC,
  LibEngineAddStore,
  LibEngineFactory
};

export interface ILibEngineModel extends Instance<typeof LibEngineModel> {}
