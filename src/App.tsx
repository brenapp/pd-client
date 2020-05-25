import React, { Fragment } from "react";
import Splash from "./routes/Splash";
import { useRoutes } from "hookrouter";

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
};

function App() {
  const location = useRoutes(routes);

  return (
    <Fragment>
      <header className="App-Header"></header>
      <main>{location}</main>
      <footer>
        <div className="angled1 green"></div>
        <div className="angled2 purple"></div>
        <div className="bottom green"></div>
      </footer>
    </Fragment>
  );
}

export default App;
