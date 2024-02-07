import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';

import App from './App';
import WeatherStore from './stores/WeatherStore';

const rootID = document.getElementById('root');

const Root = (
	<Provider WeatherStore={WeatherStore}>
		<App />
	</Provider>
);

if (typeof rootID !== 'undefined' && rootID != null) {
	ReactDOM.render(Root, rootID);
}
