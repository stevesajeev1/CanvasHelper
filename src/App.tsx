import React from 'react';
import Navigation from './Navigation'
import Clock from './Clock'
import './stylesheets/shared.css';
import './stylesheets/App.css';

function App() {
  	return (
  	  	<div className="App">
			<div className="container">
				<Clock />
			</div>
  	  	  	<Navigation />
  	  	</div>
  	);
}

export default App;