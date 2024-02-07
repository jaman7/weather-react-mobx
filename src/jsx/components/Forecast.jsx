import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Wrapper from './Layout/Wrapper';
import Span from './Layout/Span';
import H4 from './Layout/H4';

const Forecast = inject('WeatherStore')(
	observer((props) => {
		const { temp, month, day, hour, icon } = props;
		const iconUrl = `https://openweathermap.org/img/w/${icon}.png`;

		return (
			<>
				<Wrapper nameClass="item">
					<Wrapper nameClass="item-column">
						<Span>
							{month}.{day}
						</Span>
						<Span>{hour}:00</Span>
					</Wrapper>
					<img className="img-fluid" src={iconUrl} alt="" />
					<H4>{temp}&#176;</H4>
				</Wrapper>
			</>
		);
	})
);

Forecast.wrappedComponent.propTypes = {
	temp: PropTypes.number.isRequired,
	month: PropTypes.string.isRequired,
	day: PropTypes.string.isRequired,
	hour: PropTypes.number.isRequired,
	icon: PropTypes.string.isRequired
};

Forecast.wrappedComponent.defaultProps = {
	temp: null,
	month: '',
	day: '',
	hour: null,
	icon: ''
};

export default Forecast;
