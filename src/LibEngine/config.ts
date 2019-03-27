import { types, Instance } from 'mobx-state-tree';
import {
  stringLiterals,
  TBaseControlledKeys,
  BASE_CONTROLLED_KEYS,
  ElementType
} from 'ide-lib-base-component';
import { LibEngine, DEFAULT_PROPS, ILibEngineProps } from './index';
import { showConsole } from './solution';
import { IStoresModel } from './schema/stores';

import { IComponentConfig } from './interface';

export enum ESubApps {}

export const configLibEngine: IComponentConfig<
  ILibEngineProps,
  IStoresModel
> = {
  basic: {
    className: 'LibEngine'
  },
  component: {
    subject: LibEngine,
    solution: {
      onClick: [showConsole]
    },
    defaultProps: DEFAULT_PROPS,
    subComponents: {
      // normal:{},
      addStore: {}
    }
  },
  router: {
    domain: 'ide-engine'
  },
  store: {
    idPrefix: 'sle'
  },
  model: {
    props: {
      visible: types.optional(types.boolean, true),
      text: types.optional(types.string, '')
      // language: types.optional(
      //   types.enumeration('Type', CODE_LANGUAGES),
      //   ECodeLanguage.JS
      // ),
      // children: types.array(types.late((): IAnyModelType => SchemaModel)) // 在 mst v3 中， `types.array` 默认值就是 `[]`
      // options: types.map(types.union(types.boolean, types.string))
      // 在 mst v3 中， `types.map` 默认值就是 `{}`
      //  ide 的 Options 可选值参考： https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
    }
  }
};

export const SELF_CONTROLLED_KEYS = stringLiterals('visible', 'text');

export const CONTROLLED_KEYS = BASE_CONTROLLED_KEYS.concat(
  SELF_CONTROLLED_KEYS
);

// 获取被 store 控制的 model key 的列表，
export type TControlledKeys =
  | ElementType<typeof SELF_CONTROLLED_KEYS>
  | TBaseControlledKeys;
