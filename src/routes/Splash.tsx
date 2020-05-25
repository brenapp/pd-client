/**
 * Splash Screen
 */

import React, { Fragment, useState } from "react";

export interface SplashScreenProps {
  code?: string;
  enteringCode: boolean;
}

export default ({ code, enteringCode }: SplashScreenProps) => {
  const [state, setState] = useState({ code, enteringCode });

  function handleJoin(e: any) {
    e.preventDefault();
    if (state.enteringCode) {
      alert(`Join ${state.code}`);
    } else {
      setState({
        code,
        enteringCode: true,
      });
    }
  }

  function formatCode(code: string) {
    return code
      .toUpperCase()
      .replace(/[^0-9A-z]/, "")
      .slice(0, 4);
  }

  if (state.code && !state.enteringCode) {
    setState({
      enteringCode: true,
      code,
    });
  }

  return (
    <Fragment>
      <h1 className="title">
        <span className="green">P</span>
        <span className="purple">D</span>
      </h1>

      <div className="center-column">
        <button className="purple" onClick={handleJoin}>
          Join Game
        </button>
        {state.enteringCode ? (
          <input
            className="centered"
            type="text"
            value={state.code}
            placeholder="Game Code"
            onInput={(ev) =>
              setState({
                code: formatCode(ev.currentTarget.value),
                enteringCode: true,
              })
            }
          />
        ) : (
          <button className="green">Create Game</button>
        )}
      </div>
    </Fragment>
  );
};
