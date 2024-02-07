import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import SearchCity from './components/SearchCity';
import Result from './components/Result';

@inject('WeatherStore')
@observer
class App extends Component {
	async componentDidMount() {
		const { WeatherStore } = this.props;
		WeatherStore.Retrieve('Zakopane');
	}

	render() {
		return (
			<>
				<div className="container-fluid">
					<div className="row">
						<div className="col px-0">
							<SearchCity />
						</div>
					</div>
				</div>
				<div className="container-fluid bg">
					<Result />
				</div>
			</>
		);
	}
}

export default App;
