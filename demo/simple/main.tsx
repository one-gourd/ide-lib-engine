import { Instance } from 'mobx-state-tree';
import { initSuitsFromConfig } from '../../src';

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
} = initSuitsFromConfig(LibEngineCurrying, configLibEngine);

export {
  LibEngineModel,
  LibEngine,
  LibEngineHOC,
  LibEngineAddStore,
  LibEngineFactory
};

export interface ILibEngineModel extends Instance<typeof LibEngineModel> {}
