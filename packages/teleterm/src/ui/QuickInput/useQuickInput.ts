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

import React, { useEffect } from 'react';
import { useAppContext } from 'teleterm/ui/appContextProvider';
import { useKeyboardShortcuts } from 'teleterm/ui/services/keyboardShortcuts';

export default function useQuickInput() {
  const { quickInputService: serviceQuickInput } = useAppContext();
  const { visible, inputValue } = serviceQuickInput.useState();
  const [activeSuggestion, setActiveSuggestion] = React.useState(0);
  const autocompleteResult = React.useMemo(
    () => serviceQuickInput.getAutocompleteResult(inputValue),
    [inputValue]
  );
  const hasSuggestions =
    autocompleteResult.kind === 'autocomplete.partial-match';

  const onFocus = (e: any) => {
    if (e.relatedTarget) {
      serviceQuickInput.lastFocused = new WeakRef(e.relatedTarget);
    }
  };

  const onActiveSuggestion = (index: number) => {
    if (!hasSuggestions) {
      return;
    }
    setActiveSuggestion(index);
  };

  const onPickSuggestion = (index: number) => {
    if (!hasSuggestions) {
      return;

      // TODO: Choose command to launch.
      //
      // For tsh ssh: something like connect in useServerConnecto
      //
      //     documentsService.createTshNodeDocument(serverUri)
      //     doc.title =
      //     doc.login =
      //     doc.extraOptions = (TODO: Pass those options to pty service)
      //     documentsService.add(doc)
      //
      // For proxy db: useGatewayCreate
      // https://github.com/gravitational/webapps/blob/744b6a89a43a241840f59376c0b39eae82d2bf40/packages/teleterm/src/ui/commandLauncher.ts#L27-L60
      //
      //     ctx.clustersService.createGateway({ targetUri, ...params })
      //     documentsService.createGatewayDocument({})
      //
      // For any other command:
      //
      //     ctx.docsService.openNewTerminal()
      //     TODO: Needs support for initCommand
      //     https://gravitational.slack.com/archives/D030VHNF7HB/p1645445756738069
      //
      // So to some extent, we need to always create a new document here, but sometimes it involves
      // doing some extra stuff beforehand (like with the gateway).
    }

    const suggestion = autocompleteResult.suggestions[index];

    setActiveSuggestion(index);
    serviceQuickInput.pickSuggestion(
      autocompleteResult.targetToken,
      suggestion
    );
  };

  const onBack = () => {
    serviceQuickInput.goBack();
    setActiveSuggestion(0);
  };

  useKeyboardShortcuts({
    'focus-global-search': () => {
      serviceQuickInput.show();
    },
  });

  // Reset active suggestion when the suggestion list changes.
  // We extract just the tokens and stringify the list to avoid stringifying big objects.
  // See https://github.com/facebook/react/issues/14476#issuecomment-471199055
  useEffect(() => {
    setActiveSuggestion(0);
  }, [
    hasSuggestions &&
      JSON.stringify(
        autocompleteResult.suggestions.map(suggestion => suggestion.token)
      ),
  ]);

  return {
    visible,
    autocompleteResult,
    activeSuggestion,
    inputValue,
    onFocus,
    onBack,
    onPickSuggestion,
    onActiveSuggestion,
    onInputChange: serviceQuickInput.setInputValue,
    onHide: serviceQuickInput.hide,
    onShow: serviceQuickInput.show,
  };
}

export type State = ReturnType<typeof useQuickInput>;
