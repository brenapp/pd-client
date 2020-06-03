/**
 * Manages Game State
 */

import React from "react";
import globalHook, { Store } from "use-global-hook";

export interface GameState {
  // Game Position
  name: string;
  position: "game" | "lobby";
  gameCode: string | null;

  // Connection Status
  connected: boolean;
  error: boolean;
  toast: string;
  session: string;

  // Game Data
  id: string;
  guessing: boolean;
  host: boolean;
  playerState: PlayerState[];
  selectedWord: string | null;
  points: { [key: string]: number };
  stage: RoundProgression;
  ownWord: string;
  truth: string;
  guess: string;
}

export interface PlayerState {
  position: "game" | "lobby";
  gameCode: string | null;
  name: string;

  guessing: boolean;
  host: boolean;

  active: boolean;
  id: string;

  wordset: boolean | null;
}

export enum RoundProgression {
  RESEARCH,
  INVESTIGATION,
  GUESS_CORRECT,
  GUESS_INCORRECT,
}

export interface GameActions {
  setPartialState: (state: Partial<GameState>) => void;
  setError: (error: string, timeout?: number) => void;
  setToast: (message: string, timeout?: number) => void;

  // WebSocket management
  neogotiateSession: () => void;
  send: (data: object) => void;
  handleMessage: (message: MessageEvent) => void;
  handleBroadcast: (message: {
    action: "broadcast";
    broadcastType: string;
    [key: string]: string;
  }) => void;

  // Lobby Actions
  join: (name: string, code: string) => void;
  create: (name: string) => void;

  // Game Actions
  setGuessing: (id: string) => void;
  setWord: (word: string) => void;
  bootInactive: () => void;
  startRound: () => void;
  guessPlayer: (id: string) => void;
  reset: () => void;
}

export type GameStore = Store<GameState, GameActions>;

/**
 * State Transformations
 */

const actions = {
  setPartialState(store: GameStore, state: Partial<GameState>) {
    store.setState({ ...store.state, ...state });
  },

  setError(store: GameStore, error: string, timeout = 4000) {
    store.actions.setPartialState({ error: true, toast: error });
    setTimeout(() => {
      store.actions.setPartialState({ error: false, toast: "" });
    }, timeout);
  },

  setToast(store: GameStore, toast: string, timeout = 4000) {
    store.actions.setPartialState({ toast });
    setTimeout(() => {
      store.actions.setPartialState({ toast: "" });
    }, timeout);
  },

  /**
   * Socket Stuff
   */

  // Tries to reestablish a session the server holds for us
  neogotiateSession(store: GameStore) {
    const session = sessionStorage.getItem("totpal-session") ?? undefined;
    console.log("SESSION", session);

    store.actions.setPartialState({
      connected: true,
      session,
    });

    if (session) {
      store.actions.send({
        connection: "restore",
        session,
      });
    } else {
      store.actions.send({
        connection: "new",
      });
    }
  },

  // Sends data
  send(store: GameStore, data: object) {
    console.log("->", data);
    socket.send(JSON.stringify(data));
  },

  // Handles messages
  handleMessage(store: GameStore, event: MessageEvent) {
    console.log("<-", JSON.parse(event.data));

    const message: { action: string; [key: string]: any } = JSON.parse(
      event.data
    );

    if (message["error-when"]) {
      store.actions.setError(message.error);
    }

    switch (message.action) {
      case "session-set": {
        store.actions.setPartialState({ session: message.session });
        sessionStorage.setItem("totpal-session", message.session);
        break;
      }

      case "state-update": {
        const state = message.state;
        store.actions.setPartialState(state);
        break;
      }

      case "broadcast": {
        store.actions.handleBroadcast(
          message as { action: "broadcast"; broadcastType: string }
        );
        break;
      }
    }
  },

  // Specifically handles broadcasts
  handleBroadcast(
    store: GameStore,
    message: {
      action: "broacast";
      broadcastType: string;
      [key: string]: any;
    }
  ) {
    switch (message.broadcastType) {
      case "state-update": {
        const { states, selectedWord, points } = message;
        let stage: RoundProgression = store.state.stage;

        if (selectedWord === null) {
          stage = RoundProgression.RESEARCH;
        } else if (stage === RoundProgression.RESEARCH) {
          stage = RoundProgression.INVESTIGATION;
        }

        store.actions.setPartialState({
          playerState: states,
          selectedWord,
          points,
          stage,
        });

        break;
      }

      case "guess-result": {
        store.actions.setPartialState({
          stage: message.correct
            ? RoundProgression.GUESS_CORRECT
            : RoundProgression.GUESS_INCORRECT,
          truth: message.truth,
          guess: message.guess,
        });

        break;
      }

      case "game-reset": {
        store.actions.setPartialState({
          stage: RoundProgression.RESEARCH,
        });
        break;
      }
    }
  },

  //  Lobby Actions
  join(store: GameStore, name: string, code: string) {
    store.actions.setPartialState({ name, gameCode: code });
    store.actions.send({
      scope: "global",
      action: "set-name",
      name,
    });
    store.actions.send({
      scope: "global",
      action: "join",
      code,
    });
  },
  create(store: GameStore, name: string) {
    store.actions.setPartialState({ name });
    store.actions.send({
      scope: "global",
      action: "set-name",
      name,
    });
    store.actions.send({
      scope: "global",
      action: "create",
    });
  },

  // Game Actions
  setGuessing(store: GameStore, id: string) {
    return store.actions.send({
      scope: "game",
      action: "set-guessing",
      guessing: id,
    });
  },

  setWord(store: GameStore, word: string) {
    store.actions.setPartialState({
      ownWord: word,
    });

    return store.actions.send({
      scope: "game",
      action: "set-own-word",
      word,
    });
  },

  bootInactive(store: GameStore) {
    return store.actions.send({
      scope: "game",
      action: "boot-inactive",
    });
  },

  startRound(store: GameStore) {
    return store.actions.send({
      scope: "game",
      action: "select-word",
    });
  },

  guessPlayer(store: GameStore, id: string) {
    return store.actions.send({
      scope: "game",
      action: "guess-liar",
      id,
    });
  },

  reset(store: GameStore) {
    return store.actions.send({
      scope: "game",
      action: "reset-game",
    });
  },
};

/**
 * State Initalization
 */

const initalState: GameState = {
  // Game Positioning
  name: "",
  position: "lobby",
  gameCode: null,

  // Connection State
  connected: false,
  error: false,
  toast: "",
  session: sessionStorage.getItem("pd-session") || "",

  // Game Data
  id: "",
  guessing: false,
  host: false,
  playerState: [],
  selectedWord: null,
  points: {},
  stage: RoundProgression.RESEARCH,
  ownWord: "",
  truth: "",
  guess: "",
};

export const socket = new WebSocket(
  process.env["NODE_ENV"] === "production"
    ? "wss://pd-api.bren.app:8888"
    : "ws://192.168.1.15:8888"
);

function initalize(store: GameStore) {
  socket.onopen = () => store.actions.neogotiateSession();
  socket.onmessage = (ev: MessageEvent) => store.actions.handleMessage(ev);

  socket.onerror = (ev) => {
    store.actions.setError("Could not connect to Game Server!", 3000);
  };

  socket.onclose = () => {
    store.actions.setPartialState({ connected: false });
  };
}

export default globalHook<GameState, GameActions>(
  React,
  initalState,
  actions,
  initalize
);
