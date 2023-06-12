import React from 'react';
import Navigation from './Navigation'
import Clock from './Clock'
import './stylesheets/shared.css';
import './stylesheets/App.css';

function App({ showSettings }: { showSettings: (access_token: string, canvas_url: string) => void}) {
  	return (
  	  	<div className="App">
			<div className="container">
				<Clock />
			</div>
  	  	  	<Navigation showSettings={showSettings} />
  	  	</div>
  	);
}

export default App;