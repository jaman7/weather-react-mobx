import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import uuid from 'react-uuid';
import VisibilitySensor from 'react-visibility-sensor';

import Forecast from './Forecast';
import Daily from './Daily';
import Row from './Layout/Row';
import Column from './Layout/Column';
import Wrapper from './Layout/Wrapper';
import H2 from './Layout/H2';
import H3 from './Layout/H3';
import H4 from './Layout/H4';
import Span from './Layout/Span';

const Result = inject('WeatherStore')(
	observer((props) => {
		const { WeatherStore } = props;

		const { id, city, country, date, description, temp, sunset, sunrise, humidity, wind, highestTemp, lowestTemp, forecast, daily } =
			WeatherStore.WeatherData;

		const box2Str = ['Hight', 'Wind', 'Sunrise', 'Low', 'Rain', 'Sunset'];
		const box2Param = [`${Math.floor(highestTemp)}°`, `${wind} m/s`, sunrise, `${Math.floor(lowestTemp)}°`, `${humidity}%`, sunset];

		const dailyDate = (utc) => {
			return new Date(utc * 1000).toLocaleDateString();
		};

		const dayOfWeek = (utc) => {
			const time = new Date(utc * 1000);
			return WeatherStore.days[time.getDay()];
		};

		return (
			<>
				<Row nameClass="py-5">
					<Column nameClass="col-12 box-title">
						<H2>
							{city}, {country}
						</H2>
						<H4>{date}</H4>
					</Column>
					<Column nameClass="col-12 col-md-6 box-current">
						<Wrapper nameClass="box1">
							<Wrapper nameClass="box1__image">
								<i className={`icon wi wi-owm-${id}`} />
							</Wrapper>
							<Wrapper nameClass="box1__heading">
								<H3>{Math.floor(temp)}&#176;</H3>
								<H4>{description}</H4>
							</Wrapper>
						</Wrapper>
					</Column>

					<Column nameClass="col-12 col-md-6">
						<Wrapper nameClass="box2 round">
							{box2Str &&
								box2Str.map((item, i) => (
									<Wrapper key={uuid()} nameClass="item">
										<H4>{box2Param[i]}</H4>
										<Span>{item}</Span>
									</Wrapper>
								))}
						</Wrapper>
					</Column>
				</Row>

				<Row nameClass="py-3 py-md-5">
					<Column nameClass="col-12 box-title">
						<H3>Hourly Forecast 4 days</H3>
					</Column>

					<Column nameClass="col-12">
						<Wrapper iddiv="scroll" nameClass="box3 scroll">
							{forecast &&
								forecast.map((item) => (
									<Forecast
										key={item.dt}
										temp={Math.floor(item.main.temp * 1) / 1}
										icon={item.weather[0].icon}
										month={item.dt_txt.slice(5, 7)}
										day={item.dt_txt.slice(8, 10)}
										hour={item.dt_txt.slice(11, 13) * 1}
									/>
								))}
						</Wrapper>
					</Column>
				</Row>

				<Row nameClass="py-3 py-md-5">
					<Column nameClass="col-12 box-title">
						<H3>Daily Forecast 7 days</H3>
					</Column>

					<Column nameClass="col-12">
						<Wrapper nameClass="box4">
							{daily &&
								daily.map((item) => (
									<VisibilitySensor>
										{({ isVisible }) => {
											return (
												<Daily
													key={item.dt}
													tempday={Math.floor(item.temp.day * 1) / 1}
													tempMorning={Math.floor(item.temp.morn * 1) / 1}
													tempNight={Math.floor(item.temp.night * 1) / 1}
													icon={item.weather[0].icon}
													description={item.weather[0].description}
													date={dailyDate(item.dt)}
													day={dayOfWeek(item.dt)}
													sunset={WeatherStore.sunsetSunrise(item.sunset)}
													sunrise={WeatherStore.sunsetSunrise(item.sunrise)}
													front={isVisible ? ' front' : ' back'}
												/>
											);
										}}
									</VisibilitySensor>
								))}
						</Wrapper>
					</Column>
				</Row>
			</>
		);
	})
);

Result.wrappedComponent.propTypes = {
	WeatherStore: PropTypes.shape({
		WeatherData: PropTypes.shape({
			city: PropTypes.string,
			country: PropTypes.string,
			date: PropTypes.string,
			description: PropTypes.string,
			temp: PropTypes.number,
			sunrise: PropTypes.string,
			sunset: PropTypes.string,
			humidity: PropTypes.number,
			wind: PropTypes.number,
			highestTemp: PropTypes.number,
			lowestTemp: PropTypes.number,
			forecast: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
		})
	}).isRequired,
	icon: PropTypes.string
};

Result.wrappedComponent.defaultProps = {
	city: '',
	country: '',
	date: '',
	description: '',
	temp: null,
	sunrise: '',
	sunset: '',
	humidity: null,
	wind: null,
	highestTemp: null,
	lowestTemp: null,
	icon: '04n'
};

export default Result;
