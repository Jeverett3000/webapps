/*
Copyright 2021 Gravitational, Inc.

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
import { Route, Switch, useParams } from 'teleport/components/Router';
import history from 'teleport/services/history';
import LogoHero from 'teleport/components/LogoHero';
import cfg from 'teleport/config';
import NewCredentials, { Props as NewCredentialsProps } from './NewCredentials';
import CardWelcome from './CardWelcome';

export default function Welcome(props: Props) {
  const { tokenId } = useParams<{ tokenId: string }>();
  const Form = props.CustomForm ? props.CustomForm : NewCredentials;

  const handleOnInviteContinue = () => {
    history.push(cfg.getUserInviteTokenContinueRoute(tokenId));
  };

  const handleOnResetContinue = () => {
    history.push(cfg.getUserResetTokenContinueRoute(tokenId));
  };

  return (
    <>
      <LogoHero />
      <Switch>
        <Route exact path={cfg.routes.userInvite}>
          <CardWelcome
            title="Welcome to Teleport"
            subTitle="Please click the button below to create an account"
            btnText="Get started"
            onClick={handleOnInviteContinue}
          />
        </Route>
        <Route exact path={cfg.routes.userReset}>
          <CardWelcome
            title="Reset Password"
            subTitle="Please click the button below to begin recovery of your account"
            btnText="Continue"
            onClick={handleOnResetContinue}
          />
        </Route>
        <Route path={cfg.routes.userInviteContinue}>
          <Form
            tokenId={tokenId}
            title="Welcome to Teleport"
            submitBtnText="Create Account"
          />
        </Route>
        <Route path={cfg.routes.userResetContinue}>
          <Form
            resetMode={true}
            tokenId={tokenId}
            title="Reset Password"
            submitBtnText="Change Password"
          />
        </Route>
      </Switch>
    </>
  );
}

type Props = {
  CustomForm?: React.FC<Partial<NewCredentialsProps>>;
};
