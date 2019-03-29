import * as React from 'react';
import { render } from 'react-dom';
import { LibEngine, LibEngineFactory, ILibEngineProps } from './simple/main';
import {
  HeaderBlock,
  HeaderBlockFactory,
  IHeaderBlockProps
} from './has-subs/main';
import { Collapse } from 'antd';
const Panel = Collapse.Panel;

const { ComponentWithStore: LibEngineWithStore, client } = LibEngineFactory();
const {
  ComponentWithStore: HeaderBlockWithStore,
  client: clientHeaderBlock
} = HeaderBlockFactory();

function onClick(value) {
  console.log('当前点击：', value);
}
const onClickWithStore = (client) => (value) => {
  client.put(`/model`, {
    name: 'text',
    value: `gggg${Math.random()}`.slice(0, 8)
  });

  client.put('/clients/headerBar/headerbar', { name: 'logo', value: 'https://git-scm.com/images/logos/downloads/Git-Logo-2Color.png'});
}

const props: ILibEngineProps = {
  visible: true
};

render(
  <Collapse defaultActiveKey={['3']}>
    <Panel header="简单组件" key="0">
      <LibEngine {...props} onClick={onClick} />
    </Panel>
    <Panel header="简单组件 - 包含 store 功能" key="1">
      <LibEngineWithStore onClick={onClickWithStore(client)} />
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
