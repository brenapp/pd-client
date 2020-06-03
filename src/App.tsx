import React, { Fragment } from "react";
import Splash from "./routes/Splash";
import { useRoutes, navigate, usePath } from "hookrouter";
import useGameState from "./services/game";
import Game from "./routes/Game";

/**
 * Routing
 */
const routes = {
  // Splash Screen Procedures
  "/": () => <Splash enteringCode={false} />,
  "/join": (params: any) => <Splash enteringCode={true} />,
  "/join/": (params: any) => <Splash enteringCode={true} />,
  "/join/:code": (params: any) => (
    <Splash code={params.code} enteringCode={true} />
  ),
  "/game": () => <Game />,
};

function App() {
  const location = useRoutes(routes);
  const path = usePath();
  const [state] = useGameState();

  // Handle connections
  if (state.position === "game") {
    navigate("/game");
  } else {
    navigate("/");
  }

  return (
    <Fragment>
      <header
        className={state.position === "game" ? "App-Header big" : "App-Header"}
      >
        {state.position === "game" ? (
          <Fragment>
            <p>{state.name}</p>
            <p>{state.gameCode}</p>
          </Fragment>
        ) : null}
      </header>

      {state.toast || !state.connected ? (
        <div className="toast" role="alert">
          <span className={state.error ? "error" : ""}>
            {state.toast ? state.toast : "Connecting..."}
          </span>
        </div>
      ) : null}

      <main className={path.slice(1)}>{location}</main>
      <footer>
        <div className="angled1 green"></div>
        <div className="angled2 purple"></div>
        <div className="bottom green"></div>
      </footer>
    </Fragment>
  );
}

export default App;
