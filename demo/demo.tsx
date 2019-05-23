import * as React from 'react';
import { render } from 'react-dom';
import {
  LibEngine,
  LibEngineModel,
  LibEngineStoresModel,
  LibEngineFactory,
  ILibEngineProps
} from './simple/main';
import {
  HeaderBlock,
  HeaderBlockModel,
  HeaderBlockFactory,
  HeaderBlockStoresModel,
  IHeaderBlockProps
} from './has-subs/main';

import { Collapse } from 'antd';
const Panel = Collapse.Panel;

// console.log(
//   'LibEngineStoresModel:',
//   LibEngineStoresModel,
//   '\n HeaderBlockStoresModel:',
//   HeaderBlockStoresModel
// );

const {
  ComponentWithStore: LibEngineWithStore,
  client,
  stores: SimpleStores
} = LibEngineFactory();
const {
  ComponentWithStore: HeaderBlockWithStore,
  client: clientHeaderBlock
} = HeaderBlockFactory();

function onClick(value) {
  console.log('当前点击：', value);
}
const onClickWithStore = (client, isSimple = false) => (
  value,
  actionContext
) => {
  const { context } = actionContext;
  console.log('[onClick] action context:', context);

  client.put(`/model`, {
    name: 'text',
    value: `gggg${Math.random()}`.slice(0, 1 + 10 * Math.random())
  });

  client.put('/alias/blockbar', {
    name: 'logo',
    value: 'https://git-scm.com/images/logos/downloads/Git-Logo-2Color.png'
  });

  isSimple &&
    console.log('stores.model.textLength: ', SimpleStores.model.textLength);
};

const props: ILibEngineProps = {
  visible: true
};

render(
  <Collapse defaultActiveKey={['3']}>
    <Panel header="简单组件" key="0">
      <LibEngine {...props} onClick={onClick} />
    </Panel>
    <Panel header="简单组件 - 包含 store 功能" key="1">
      <LibEngineWithStore onClick={onClickWithStore(client, true)} />
    </Panel>
    <Panel header="含子组件" key="2">
      <HeaderBlock {...props} onClick={onClick} />
    </Panel>
    <Panel header="含子组件 - 包含 store 功能" key="3">
      <HeaderBlockWithStore onClick={onClickWithStore(clientHeaderBlock)} />
    </Panel>
  </Collapse>,
  document.getElementById('example') as HTMLElement
);

client.post('/model', {
  model: {
    visible: true,
    text: `text${Math.random()}`.slice(0, 8)
  }
});

// 测试 JSON 格式属性
setTimeout(() => {
  clientHeaderBlock
    .put('/model', {
      name: 'propsEditor',
      value: {
        formData: {
          a: 1,
          b: 3
        },
        schema: { c: 4 }
      }
    })
    .then(() => {
      clientHeaderBlock.get('/model?filter=propsEditor').then(res => {
        console.log(
          555,
          res.body.data.attributes.propsEditor.formData,
          res.body.data.attributes.propsEditor.schema
        );
      });
    });
}, 2000);
