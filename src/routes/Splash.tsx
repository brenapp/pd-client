/**
 * Splash Screen
 */

import React, { Fragment, useState } from "react";
import useGameState from "../services/game";

export interface SplashScreenProps {
  code?: string;
  enteringCode: boolean;
}

export default ({ code, enteringCode }: SplashScreenProps) => {
  const [gameState, actions] = useGameState();
  const [localState, setLocalState] = useState({
    code,
    enteringCode,
    name: gameState.name,
  });

  function handleJoin(e: any) {
    e.preventDefault();
    codeInput?.focus();

    if (localState.enteringCode) {
      if (!localState.code || localState.code.length !== 4) {
        actions.setError("Make sure you've entered the correct 4-digit code!");

        return;
      } else {
        actions.setPartialState({ toast: "" });
      }

      actions.join(localState.name, localState.code);
    } else {
      setLocalState({
        ...localState,
        code,
        enteringCode: true,
      });
    }
  }

  function handleCreate(e: any) {
    e.preventDefault();
    actions.create(localState.name);
  }

  function formatCode(code: string) {
    return code
      .toUpperCase()
      .replace(/[^0-9A-z]/, "")
      .slice(0, 4);
  }

  if (localState.code && !localState.enteringCode) {
    setLocalState({
      ...localState,
      enteringCode: true,
      code,
    });
  }

  let codeInput: HTMLInputElement | null = null;

  return (
    <Fragment>
      <h1 className="title">
        <span className="green">P</span>
        <span className="purple">D</span>
      </h1>

      <div className="center-column">
        <input
          className="centered green"
          type="text"
          value={localState.name}
          placeholder="Nickname"
          aria-label="Set your nickname"
          autoFocus
          onChange={(ev) =>
            setLocalState({
              ...localState,
              name: ev.currentTarget.value.toUpperCase(),
            })
          }
        />

        {localState.enteringCode ? (
          <input
            className="centered"
            type="text"
            value={localState.code}
            placeholder="Game Code"
            aria-label="The game code"
            autoFocus
            inputMode="numeric"
            ref={(input) => (codeInput = input)}
            onKeyDown={(ev) => (ev.keyCode === 13 ? handleJoin(ev) : null)}
            onChange={(ev) =>
              setLocalState({
                ...localState,
                code: formatCode(ev.currentTarget.value),
              })
            }
          />
        ) : (
          <button className="green" onClick={handleCreate}>
            Create Game
          </button>
        )}

        <button className="purple" onClick={handleJoin}>
          Join Game
        </button>
      </div>
    </Fragment>
  );
};
