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

import { useStore } from 'shared/libs/stores';
import { ImmutableStore } from '../immutableStore';
import { WorkspaceService } from 'teleterm/ui/services/workspace';
import {
  DocumentsService,
  DocumentGateway,
  DocumentTshNode,
} from 'teleterm/ui/services/docs';
import { ClustersService } from 'teleterm/ui/services/clusters';
import { unique } from 'teleterm/ui/utils/uid';

export class ConnectionTrackerService extends ImmutableStore<ConnectionTrackerState> {
  state: ConnectionTrackerState = {
    connections: [],
  };

  constructor(
    private _workspaceService: WorkspaceService,
    private _documentService: DocumentsService,
    private _clusterService: ClustersService
  ) {
    super();

    this.state.connections = this._restoreConnectionItems();
    this._documentService.subscribe(this._refreshState);
    this._clusterService.subscribe(this._refreshState);
  }

  useState() {
    return useStore(this).state;
  }

  findAllTshDocuments(id: string) {
    const conn = this.state.connections.find(i => i.id === id);
    if (conn.kind === 'connection.server') {
      return this._documentService
        .getTshNodeDocuments()
        .filter(
          doc => conn.serverUri === doc.serverUri && conn.login === doc.login
        );
    }
  }

  isConnected(id: string) {
    return this.findConnection(id).connected;
  }

  findConnection(id: string) {
    return this.state.connections.find(i => i.id === id);
  }

  processItemClick = (id: string) => {
    const conn = this.state.connections.find(i => i.id === id);

    switch (conn.kind) {
      case 'connection.server':
        let srvDoc = this._documentService
          .getTshNodeDocuments()
          .find(
            doc => conn.serverUri === doc.serverUri && conn.login === doc.login
          );

        if (!srvDoc) {
          srvDoc = this._documentService.createTshNodeDocument(conn.serverUri);
          srvDoc.status = 'disconnected';
          srvDoc.login = conn.login;
          srvDoc.title = conn.title;

          this._documentService.add(srvDoc);
        }
        this._documentService.open(srvDoc.uri);
        return;
      case 'connection.gateway':
        let gwDoc = this._documentService
          .getGatewayDocuments()
          .find(
            doc => doc.targetUri === conn.targetUri && doc.port === conn.port
          );

        if (!gwDoc) {
          gwDoc = this._documentService.createGatewayDocument({
            targetUri: conn.targetUri,
            targetUser: conn.targetUser,
            title: conn.title,
            gatewayUri: conn.gatewayUri,
            port: conn.port,
          });

          this._documentService.add(gwDoc);
        }
        this._documentService.open(gwDoc.uri);
    }
  };

  processItemRemove = (id: string) => {
    this.setState(draft => {
      draft.connections = draft.connections.filter(i => i.id !== id);
    });

    this._workspaceService.saveConnectionTrackerState(this.state);
  };

  dispose() {
    this._documentService.unsubscribe(this._refreshState);
  }

  private _refreshState = () => {
    this.setState(draft => {
      // assign default "connected" values
      draft.connections.forEach(i => {
        if (i.kind === 'connection.gateway') {
          i.connected = !!this._clusterService.findGateway(i.gatewayUri);
        } else {
          i.connected = false;
        }
      });

      const docs = this._documentService
        .getDocuments()
        .filter(
          d => d.kind === 'doc.gateway' || d.kind === 'doc.terminal_tsh_node'
        );

      while (docs.length > 0) {
        const doc = docs.pop();

        switch (doc.kind) {
          // process gateway connections
          case 'doc.gateway':
            const gwConn = draft.connections.find(
              i =>
                i.kind === 'connection.gateway' &&
                i.targetUri === doc.targetUri &&
                i.port === doc.port
            ) as GatewayConnection;

            if (!gwConn) {
              const newItem = this._createGatewayConnItem(doc);
              draft.connections.push(newItem);
            } else {
              gwConn.gatewayUri = doc.gatewayUri;
              gwConn.connected = !!this._clusterService.findGateway(
                doc.gatewayUri
              );
            }

            break;
          // process tsh connections
          case 'doc.terminal_tsh_node':
            const tshConn = draft.connections.find(
              i =>
                i.kind === 'connection.server' &&
                i.serverUri === doc.serverUri &&
                i.login === doc.login
            );

            if (tshConn) {
              tshConn.connected = doc.status === 'connected';
            } else {
              const newItem = this._createServerConnItem(doc);
              draft.connections.push(newItem);
            }
            break;
        }
      }
    });

    this._workspaceService.saveConnectionTrackerState(this.state);
  };

  private _createServerConnItem(doc: DocumentTshNode): ServerConnection {
    return {
      connected: doc.status === 'connected',
      id: unique(),
      title: doc.title,
      login: doc.login,
      serverUri: doc.serverUri,
      kind: 'connection.server',
    };
  }

  private _createGatewayConnItem(doc: DocumentGateway): GatewayConnection {
    return {
      connected: true,
      id: unique(),
      title: doc.title,
      port: doc.port,
      targetUri: doc.targetUri,
      targetUser: doc.targetUser,
      kind: 'connection.gateway',
      gatewayUri: doc.gatewayUri,
    };
  }

  private _restoreConnectionItems(): Connection[] {
    const savedState = this._workspaceService.getConnectionTrackerState();
    if (savedState && Array.isArray(savedState.connections)) {
      // restored connections cannot have connected state
      savedState.connections.forEach(i => {
        i.connected = false;
      });

      return savedState.connections;
    }

    return [];
  }
}

export type ConnectionTrackerState = {
  connections: Connection[];
};

type Item = {
  kind: 'connection.server' | 'connection.gateway';
  connected: boolean;
};

export interface ServerConnection extends Item {
  kind: 'connection.server';
  title: string;
  id?: string;
  serverUri: string;
  login: string;
}

export interface GatewayConnection extends Item {
  kind: 'connection.gateway';
  title: string;
  id: string;
  targetUri: string;
  targetUser?: string;
  port?: string;
  gatewayUri: string;
}

export type Connection = ServerConnection | GatewayConnection;
