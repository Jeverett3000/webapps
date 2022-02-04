/*
Copyright 2019 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import styled from 'styled-components';
import { space, color } from 'design/system';
import { Flex } from 'design';
import Icon from 'design/Icon';
import * as Icons from 'design/Icon';
import { ButtonIcon } from 'teleterm/ui/components/ButtonIcon';

export const ExpanderHeader: React.FC<
  ExpanderHeaderProps
  > = props => {
  const {
    onContextMenu,
    children,
    toggleTrigger = 'header',
    icons: { Expanded = Icons.CarrotDown, Collapsed = Icons.CarrotRight } = {},
    expanded,
    onToggle,
    ...styles
  } = props;
  const ArrowIcon = expanded ? Expanded : Collapsed;

  function handleHeaderClick(event: MouseEvent) {
    if (toggleTrigger === 'header') {
      onToggle?.();
      event.stopPropagation();
    }
  }

  function handleIconClick(event: MouseEvent) {
    if (toggleTrigger === 'icon') {
      onToggle?.();
      event.stopPropagation();
    }
  }

  return (
    <StyledHeader
      {...styles}
      onContextMenu={onContextMenu}
      onClick={handleHeaderClick}
    >
      <ButtonIcon mr="1" onClick={handleIconClick}>
        <ArrowIcon style={{ fontSize: '12px' }} />
      </ButtonIcon>
      <Flex flex="1" overflow="hidden">
        {children}
      </Flex>
    </StyledHeader>
  );
};

export const ExpanderContent = styled(Flex)(props => {
  return {
    color: props.theme.colors.text.secondary,
    flexDirection: 'column',
    height: '100%',
  };
});

export const StyledHeader = styled(Flex)(props => {
  const theme = props.theme;
  return {
    width: '100%',
    margin: '0',
    boxSizing: 'border-box',
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    textDecoration: 'none',
    lineHeight: '24px',
    fontSize: '12px',
    fontWeight: theme.regular,
    fontFamily: theme.font,
    paddingLeft: theme.space[2] + 'px',
    background: theme.colors.primary.main,
    color: theme.colors.text.primary,
    '&.active': {
      borderLeftColor: theme.colors.accent,
      background: theme.colors.primary.lighter,
      color: theme.colors.primary.contrastText,
      '.marker': {
        background: theme.colors.secondary.light,
      },
    },

    '&:hover, &:focus': {
      color: theme.colors.primary.contrastText,
      background: theme.colors.primary.light,
    },

    height: '36px',
    ...space(props),
    ...color(props),
  };
});

export type ExpanderHeaderProps = {
  onContextMenu?: () => void;
  toggleTrigger?: 'icon' | 'header';
  icons?: {
    Expanded: typeof Icon;
    Collapsed: typeof Icon;
  };
  onToggle?(): void;
  expanded?: boolean;
  [key: string]: any;
};
