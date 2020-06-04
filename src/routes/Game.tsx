import React, { Fragment, useState } from "react";
import useGameState, { RoundProgression, PlayerState } from "../services/game";

export default () => {
  const [state, actions] = useGameState();
  const [localState, setLocalState] = useState({ topic: "" });

  // Set the title
  let title;
  let subtitle;

  switch (state.stage) {
    case RoundProgression.RESEARCH: {
      if (state.playerState.length < 3) {
        subtitle = "Game Code";
        title = state.gameCode;
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

    case RoundProgression.INVESTIGATION: {
      title = `"${state.selectedWord}"`;
      subtitle = "The Prompt Is:";
      break;
    }

    case RoundProgression.GUESS_CORRECT: {
      subtitle = "Guessed Correct!";
      title = `${state.truth} was telling the truth!`;
      break;
    }

    case RoundProgression.GUESS_INCORRECT: {
      subtitle = "Guessed Incorrectly!";
      title = `${state.truth} was telling the truth!`;
      break;
    }
  }

  function validateWord() {
    const topic = localState.topic;

    if (topic.length < 3) {
      actions.setError("Make sure you have entered the title of the article!");
    } else if (topic.includes("wikipedia.org")) {
      actions.setError(
        "Make sure you've included the title of the article, not the URL!"
      );
    } else {
      actions.setWord(localState.topic);
      actions.setToast("Submitted topic!");
    }
  }

  function startGame() {
    const ready = state.playerState.every(
      (player) => player.wordset || player.guessing
    );

    if (ready && state.playerState.length > 2) {
      actions.startRound();
    } else {
      actions.setError("Not ready to start!");
    }
  }

  function playerClick(player: PlayerState) {
    return () => {
      if (state.stage !== RoundProgression.INVESTIGATION) return;
      if (player.guessing) return;
      if (!state.guessing) return;

      actions.guessPlayer(player.id);
    };
  }

  const investigator = state.playerState.find((player) => player.guessing);

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
              {state.stage === RoundProgression.RESEARCH ? (
                <button className="white txt-green small" onClick={startGame}>
                  Start Round
                </button>
              ) : (
                <button
                  className="white txt-green small"
                  onClick={actions.reset}
                >
                  Reset Game
                </button>
              )}

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

        {state.stage === RoundProgression.INVESTIGATION && state.guessing ? (
          <p>
            When you think you know who is telling the truth, you can tap their
            name to select them. If you guess correctly, you'll be awarded a
            point!
          </p>
        ) : (
          <Fragment>
            {state.stage === RoundProgression.INVESTIGATION &&
            state.selectedWord === state.ownWord ? (
              <p>
                Your word has been choosen! You now have to convince{" "}
                {investigator?.name} of the truth! If they pick you, you'll be
                awarded a point!
              </p>
            ) : null}

            {state.stage === RoundProgression.INVESTIGATION &&
            state.selectedWord !== state.ownWord ? (
              <p>
                Your word was not choosen! Now, you need to lie to{" "}
                {investigator?.name} to try and convince them you know what
                you're talking about. If you convince them successfully, then
                you'll be awarded a point!
              </p>
            ) : null}
          </Fragment>
        )}

        <ul className="block">
          {state.playerState.map((player) => {
            const clickable =
              state.guessing &&
              state.stage === RoundProgression.INVESTIGATION &&
              !player.guessing;

            return (
              <li
                key={player.id}
                onClick={playerClick(player)}
                onKeyPress={(ev) =>
                  ev.key === "Enter" ? playerClick(player)() : null
                }
                // Only advertise it as focusable to screen readers if there is an action
                {...(clickable ? { role: "button", tabIndex: 0 } : {})}
                className={clickable ? "clickable" : ""}
              >
                {player.name} {player.active ? null : "(inactive)"}{" "}
                {player.host ? "(HOST)" : null}{" "}
                {player.guessing ? "(INVESTIGATOR)" : null}
                {" — "}
                {state.points[player.id]} points
              </li>
            );
          })}
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
                aria-label="Set your topic here"
                placeholder="Your Topic"
                autoFocus
                value={localState.topic}
                onChange={(ev) =>
                  setLocalState({ topic: ev.currentTarget.value })
                }
                onKeyDown={(ev) => (ev.keyCode === 13 ? validateWord() : null)}
              />
              <button className="small purple" onClick={() => validateWord()}>
                Set Topic
              </button>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <h3>You are the investigator!</h3>
            <p>
              When the round starts, it will be your job to talk to every other
              player and determine who is telling the truth, and who is lying
            </p>
          </Fragment>
        )}
      </div>
    </Fragment>
  );
};
