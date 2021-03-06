/**
 * MIT License
 *
 * Copyright (c) 2019-2020 char-lie
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import React from 'react';
import {
  Container,
  Nav,
  Navbar,
} from 'react-bootstrap';
import {
  Link,
  Route,
  Switch,
} from 'react-router-dom';
import { withRouter } from 'react-router';

import Zeroth from './Zeroth';
import First from './First';
import Second from './Second';
import Home from './Home';

const App = withRouter(() => (
  <Container>
    <Navbar bg="light" variant="light">
      <Nav activeKey={window.location.pathname}>
        <Navbar.Brand as={Link} to="/">Pattern Recognition</Navbar.Brand>
        <Nav.Link eventKey="/" as={Link} to="/">Home</Nav.Link>
        <Nav.Link eventKey="/zeroth" as={Link} to="/zeroth">Zeroth</Nav.Link>
        <Nav.Link eventKey="/first" as={Link} to="/first">First</Nav.Link>
        <Nav.Link eventKey="/second" as={Link} to="/second">Second</Nav.Link>
      </Nav>
    </Navbar>
    <Switch>
      <Route
        path="/"
        component={Home}
        exact
      />
      <Route
        path="/zeroth"
        component={Zeroth}
        exact
      />
      <Route
        path="/first"
        component={First}
        exact
      />
      <Route
        path="/second"
        component={Second}
        exact
      />
    </Switch>
  </Container>
));

export default App;
