import {
  cast,
  types,
  Instance,
  IAnyModelType,
  SnapshotOrInstance
} from 'mobx-state-tree';

import { quickInitModel } from '../../../src/';
import { JSONModel } from 'ide-lib-base-component';

/**
 * 属性编辑器 model
 */
export const PropsEditorModel: IAnyModelType = quickInitModel(
  'PropsEditorModel',
  {
    schema: JSONModel, // 属性 schema 描述
    formData: JSONModel // 属性值
  }
);

// const bb = types.model('xxx', {
//     _schema: JSONModel, // 属性 schema 描述
//     _formData: JSONModel, // 属性值
//     _pageStore: JSONModel // 页面 store，用于提示
//   })
//   .views(self => ({
//     get schema() {
//       return self._schema.value;
//     },
//     get formData() {
//       return self._formData.value;
//     },
//     get pageStore() {
//       return self._pageStore.value;
//     }
//   }))
//   .actions(self => {
//     return {
//       setSchema: (o: string | object) => {
//         self._schema.setValue(o);
//       },
//       setFormData: (o: string | object) => {
//         self._formData.setValue(o);
//       },
//       setPageStore: (o: string | object) => {
//         self._pageStore.setValue(o);
//       }
//     };
//   })

export const CONTROLLED_KEYS_PROPSEDITOR = ['schema', 'formData'];

export interface IPropsEditorModel extends Instance<typeof PropsEditorModel> {}
export interface IPropsEditorModelSnapshot
  extends SnapshotOrInstance<typeof PropsEditorModel> {}
