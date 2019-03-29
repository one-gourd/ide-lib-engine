import React, { useCallback } from 'react';
import { Button } from 'antd';
import { IBaseTheme, IBaseComponentProps } from 'ide-lib-base-component';

import { TComponentCurrying } from '../../src';

import { StyledContainer } from './styles';
import { ISubProps  } from './subs';



export interface IHeaderBlockEvent {
  /**
   * 点击回调函数
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

// export interface IHeaderBlockStyles extends IBaseStyles {
//   container?: React.CSSProperties;
// }

export interface IHeaderBlockTheme extends IBaseTheme {
  main: string;
}

export interface IHeaderBlockProps
  extends IHeaderBlockEvent,
    ISubProps,
    IBaseComponentProps {
  /**
   * 是否展现
   */
  visible?: boolean;

  /**
   * 文案
   */
  text?: string;
}

export const DEFAULT_PROPS: IHeaderBlockProps = {
  visible: true,
  theme: {
    main: '#25ab68'
  },
  headerBar:{
    buttons: [
      {
        id: 'edit',
        title: '编辑',
        icon: 'edit'
      }
    ]
  },
  styles: {
    container: {}
  }
};

export const HeaderBlockCurrying: TComponentCurrying<
  IHeaderBlockProps
> = subComponents => props => {
  const { headerBar, visible, text, styles, onClick } = props;
  const { HeaderBar } = subComponents as Record<string, React.FunctionComponent<typeof props>>;

  const onClickButton = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick && onClick(e);
    },
    [onClick]
  );

  return (
    <StyledContainer
      style={styles.container}
      visible={visible}
      // ref={this.root}
      className="ide-lib-engine-container"
    >
      <Button onClick={onClickButton}>{text || '点我试试'}</Button>
      <HeaderBar {...headerBar} />
    </StyledContainer>
  );
};
