import { BrowserRouter, Route } from 'react-router-dom'

import { Home } from "./pages/Home"
import { Quiz } from "./pages/Quiz"

const Routes = () => {
  return (
    <BrowserRouter>
        <Route path="/" exact component={ Home }/>
        <Route path="/quiz/:id" component={ Quiz }/>
    </BrowserRouter>
  );
}

export default Routes;
