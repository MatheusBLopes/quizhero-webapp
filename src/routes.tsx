import { BrowserRouter, Route } from 'react-router-dom'

import { Home } from "./pages/Home"

const Routes = () => {
  return (
    <BrowserRouter>
        <Route path="/" exact component={ Home }/>
    </BrowserRouter>
  );
}

export default Routes;
