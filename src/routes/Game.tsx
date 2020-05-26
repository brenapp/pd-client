import React, { Fragment, useState } from "react";
import useGameState, { RoundProgression } from "../services/game";

export default () => {
  const [state, actions] = useGameState();
  const [localState, setLocalState] = useState({ topic: "" });

  // Set the title
  let title;
  let subtitle;

  switch (state.stage) {
    case RoundProgression.RESEARCH: {
      if (state.playerState.length < 3) {
        subtitle = "Waiting For More Players...";
        title = "";
      } else if (
        state.playerState.every((player) => player.wordset || player.guessing)
      ) {
        title = "Ready to Start!";
      } else {
        const notSubmitted = state.playerState.filter(
          (player) => !player.wordset && !player.guessing
        );
        subtitle = "Research Phase";
        title = `Waiting on ${notSubmitted.map((p) => p.name).join(", ")}...`;
      }

      break;
    }
  }

  return (
    <Fragment>
      <h3 className="subtitle center">{subtitle}</h3>
      <h1 className="center">
        <span className="purple">{title}</span>
      </h1>
      <div className="card">
        <header className="green">
          {state.host ? (
            <Fragment>
              <button className="white txt-green small">Start Round</button>
              <button
                className="white txt-green small"
                onClick={actions.bootInactive}
              >
                Kick Inactive Players
              </button>
            </Fragment>
          ) : (
            <p className="white">Players</p>
          )}
        </header>

        <ul className="block">
          {state.playerState.map((player) => (
            <li
              className={
                state.guessing && state.stage === RoundProgression.INVESTIGATION
                  ? "clickable"
                  : ""
              }
            >
              {player.name} {player.active ? null : "(inactive)"}
            </li>
          ))}
        </ul>
        {!state.guessing ? (
          <Fragment>
            <p>
              While you're waiting for people to join, go find a{" "}
              <a
                href="https://en.wikipedia.org/wiki/Special:Random"
                rel="noopener noreferrer"
                target="_blank"
              >
                random Wikipedia
              </a>{" "}
              article, and try to remember as much as you can. When you've found
              one you like, enter the title of the article below
            </p>

            <div className="formgroup">
              <input
                type="text"
                placeholder="Your Topic"
                value={localState.topic}
                onInput={(ev) =>
                  setLocalState({ topic: ev.currentTarget.value })
                }
                onBlur={() => actions.setWord(localState.topic)}
              />
              <button className="small purple">Set Topic</button>
            </div>
          </Fragment>
        ) : null}
      </div>
    </Fragment>
  );
};
