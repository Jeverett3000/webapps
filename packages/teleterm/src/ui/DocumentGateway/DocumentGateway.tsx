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
import { Text, Flex, Box, ButtonPrimary } from 'design';
import Document from 'teleterm/ui/Document';
import * as Alerts from 'design/Alert';
import * as types from 'teleterm/ui/services/workspacesService';
import LinearProgress from 'teleterm/ui/components/LinearProgress';
import { GatewayProtocol } from 'teleterm/ui/services/clusters/types';
import useDocumentGateway, { State } from './useDocumentGateway';
import { Postgres } from './Postgres';
import { Mongo } from './Mongo';
import { MySql } from './MySql';

type Props = {
  visible: boolean;
  doc: types.DocumentGateway;
};

export default function Container(props: Props) {
  const { doc, visible } = props;
  const state = useDocumentGateway(doc);
  return (
    <Document visible={visible}>
      <DocumentGateway {...state} />
    </Document>
  );
}

export function DocumentGateway(props: State) {
  const { doc, gateway, connected, connectAttempt, disconnect, reconnect } =
    props;

  if (!connected) {
    return (
      <Flex flexDirection="column" mx="auto" alignItems="center" mt={100}>
        <Text
          typography="h5"
          color="text.primary"
          style={{ position: 'relative' }}
        >
          The Database Proxy connection is currently offline
          {connectAttempt.status === 'processing' && <LinearProgress />}
        </Text>
        {connectAttempt.status === 'error' && (
          <Alerts.Danger>{connectAttempt.statusText}</Alerts.Danger>
        )}
        <ButtonPrimary
          mt={4}
          width="100px"
          onClick={reconnect}
          disabled={connectAttempt.status === 'processing'}
        >
          Reconnect
        </ButtonPrimary>
      </Flex>
    );
  }

  switch (gateway.protocol as GatewayProtocol) {
    case 'mongodb':
      return (
        <Mongo gateway={gateway} title={doc.title} disconnect={disconnect} />
      );
    case 'postgres':
      return (
        <Postgres gateway={gateway} title={doc.title} disconnect={disconnect} />
      );
    case 'mysql':
      return (
        <MySql gateway={gateway} title={doc.title} disconnect={disconnect} />
      );
    default:
      return <Box> {`Unknown protocol type ${gateway.protocol}`}</Box>;
  }
}
