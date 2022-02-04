/**
 * Copyright 2022 Gravitational, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { ExpanderConnectionsBodyPresentational } from './ExpanderConnections';
import { MockAppContextProvider } from 'teleterm/ui/fixtures/MockAppContextProvider';
import { State } from './useExpanderConnections';

export default {
  title: 'Teleterm/Navigator/ExpanderConnections',
};

function getState(): State {
  return {
    onContextMenu() {},
    processRemove() {},
    processClick() {},
    items: [
      {
        connected: true,
        kind: 'connection.server',
        title: 'graves',
        id: 'e9c4fbc2',
        serverUri: 'brock',
        login: 'casey',
      },
      {
        connected: true,
        kind: 'connection.gateway',
        title: 'graves',
        id: '68b6a281',
        targetUri: 'brock',
        port: '22',
        gatewayUri: 'empty',
      },
      {
        connected: false,
        kind: 'connection.server',
        title: 'graves',
        id: '949651ed',
        serverUri: 'brock',
        login: 'casey',
      },
    ],
  };
}

export function ExpanderConnections() {
  return (
    <MockAppContextProvider>
      <ExpanderConnectionsBodyPresentational {...getState()} />
    </MockAppContextProvider>
  );
}
