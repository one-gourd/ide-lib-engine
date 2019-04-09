import { types, IAnyModelType } from 'mobx-state-tree';
import { BASE_CONTROLLED_KEYS } from 'ide-lib-base-component';

import { DEFAULT_PROPS, ILibEngineProps } from '.';
import { showConsole } from './solution';
import { IModuleConfig } from '../../src';

import { router as GetRouter } from './router/get';
import { router as PostRouter } from './router/post';
import { router as PutRouter } from './router/put';
import { router as DelRouter } from './router/del';

export const configLibEngine: IModuleConfig<ILibEngineProps, never> = {
  component: {
    className: 'LibEngine',
    solution: {
      onClick: [showConsole]
    },
    defaultProps: DEFAULT_PROPS,
    children: {}
  },
  router: {
    domain: 'ide-engine',
    list: [GetRouter, PostRouter, PutRouter, DelRouter]
  },
  store: {
    idPrefix: 'sle'
  },
  model: {
    controlledKeys: [], // 后续再初始化
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
    }, 
    extends: (model: IAnyModelType) => {
      return model.views(self=>{
        return {
          get textLength(){
            return self.text.length
          }
        }
      }).actions(self=>{
        return {
          appendTag(){
            self.text += 'tag';
          }
        }
      });
    }
  }
};

// 枚举受 store 控制的 key，一般来自 config.model.props 中 key
// 当然也可以自己枚举
export const SELF_CONTROLLED_KEYS = Object.keys(configLibEngine.model.props); // ['visible', 'text']

export const CONTROLLED_KEYS = BASE_CONTROLLED_KEYS.concat(
  SELF_CONTROLLED_KEYS
);

// 初始化 controlledKeys
configLibEngine.model.controlledKeys = CONTROLLED_KEYS;
