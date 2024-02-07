/* eslint-disable no-unused-vars */
import React from 'react';
import { toJS, observable, configure, makeObservable, action, runInAction } from 'mobx';
import axios from 'axios';

axios.defaults.baseURL = 'https://api.openweathermap.org/data/2.5/';
axios.defaults.responseType = 'json';
const apikey = 'ae98d58d517252f2065829367d320dbb';
const urloptions = `&APPID=${apikey}&units=metric`;

configure({
	enforceActions: 'never'
});

class WeatherStore {
	@observable WeatherData = { icon: '04n' };

	@observable isLoading = true;

	@observable weatherInfo = false;

	@observable error = false;

	@observable searchResults = {
		city: 'Zakopane',
		place: 'Zakopane, powiat tatrzański, województwo małopolskie, Polska',
		language: 'pl',
		latitude: 49.3,
		longitude: 19.96667
	};

	@observable months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	@observable days = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	];

	constructor() {
		makeObservable(this, {
			WeatherData: observable,
			isLoading: observable,
			weatherInfo: observable,
			error: observable,
			searchResults: observable,
			months: observable,
			days: observable
		});
	}

	@action exists = (x) => x !== null || typeof x !== 'undefined' || x !== '';

	@action sunsetSunrise = (utc) => new Date(utc * 1000).toLocaleTimeString().slice(0, 5);

	@action async Retrieve() {
		try {
			this.isLoading = true;

			const { city, latitude, longitude } = this.searchResults;

			const weather = await axios.get(`weather?q=${city}${urloptions}`);
			const forecast = await axios.get(`forecast?q=${city}${urloptions}`);
			const forecast7 = await axios.get(
				`onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${apikey}`
			);
			const weatherRequests = weather.data;
			const forecastRequests = forecast.data;
			const forecastRequests7 = forecast7.data;

			const weatherAll = await Promise.all([
				weatherRequests,
				forecastRequests,
				forecastRequests7
			]);

			const currentDate = new Date();
			const date = `${this.days[currentDate.getDay()]} ${currentDate.getDate()} ${
				this.months[currentDate.getMonth()]
			}`;

			const sunset = this.sunsetSunrise(weatherAll[0].sys.sunset);
			const sunrise = this.sunsetSunrise(weatherAll[0].sys.sunrise);

			const WeatherData = {
				city: weatherAll[0].name,
				country: weatherAll[0].sys.country,
				date,
				description: weatherAll[0].weather[0].description,
				main: weatherAll[0].weather[0].main,
				icon: weatherAll[0].weather[0].icon,
				id: weatherAll[0].weather[0].id,
				temp: weatherAll[0].main.temp,
				highestTemp: weatherAll[0].main.temp_max,
				lowestTemp: weatherAll[0].main.temp_min,
				sunrise,
				sunset,
				clouds: weatherAll[0].clouds.all,
				humidity: weatherAll[0].main.humidity,
				wind: weatherAll[0].wind.speed,
				forecast: weatherAll[1].list,
				daily: weatherAll[2].daily
			};
			runInAction(() => {
				this.isLoading = false;
				this.weatherInfo = true;
				this.WeatherData = WeatherData;
				this.error = false;
			});
		} catch (error) {
			this.weatherInfo = true;
			this.isLoading = false;
			this.errorMsg = 'Error loading todos';
		}
	}

	@action addResults = (city, place, language, latitude, longitude) => {
		this.searchResults = {
			city,
			place,
			language,
			latitude,
			longitude
		};

		this.Retrieve();
	};
}

const store = new WeatherStore();

export default store;
