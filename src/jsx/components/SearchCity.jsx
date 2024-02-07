import React, { useState, useRef, useCallback } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import ReactMapGL, { Marker } from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiamFtYW43IiwiYSI6ImNqbmV0bTFrczBrZG8zcm80Y2h4ZGF1ajQifQ.8aCc8P2-eq4hqman9k0E7g';

const SearchCity = inject('WeatherStore')(
	observer((props) => {
		const { WeatherStore } = props;

		const mapRef = useRef();

		const styles = {
			width: '100%',
			height: 'calc(50vh - 80px)'
		};

		const [viewport, setViewport] = useState({
			latitude: 49.3,
			longitude: 19.96667,
			zoom: 6,
			bearing: 0,
			pitch: 0
		});

		const { city, place, language, latitude, longitude } = WeatherStore.searchResults;

		const [Results, setResults] = useState({
			city,
			place,
			language,
			latitude,
			longitude
		});

		const handleGetSearch = useCallback((prevState) => {
			const { result } = prevState;
			const lang = (data) => {
				return 'language' in data ? data.language : data.context[1].language;
			};

			const lat = result.geometry.coordinates[1];
			const lon = result.geometry.coordinates[0];

			if (result.text !== city) {
				setResults(() => ({
					...Results,
					city: result.text,
					place: result.place_name,
					language: lang(result),
					latitude: lat,
					longitude: lon
				}));

				WeatherStore.addResults(result.text, result.place_name, lang(result), lat, lon);
			}
		}, []);

		const handleViewportChange = useCallback((newViewport) => setViewport(newViewport), []);
		const handleGeocoderViewportChange = useCallback((newViewport) => {
			const geocoderDefaultOverrides = { transitionDuration: 1000 };

			return handleViewportChange({
				...newViewport,
				...geocoderDefaultOverrides
			});
		}, []);

		return (
			<div className="mapbox-react">
				<ReactMapGL
					ref={mapRef}
					{...viewport}
					{...styles}
					mapStyle="mapbox://styles/mapbox/streets-v11"
					onViewportChange={(nextViewport) => setViewport(nextViewport)}
					mapboxApiAccessToken={MAPBOX_TOKEN}
				>
					<Geocoder
						mapRef={mapRef}
						onViewportChange={handleGeocoderViewportChange}
						mapboxApiAccessToken={MAPBOX_TOKEN}
						position="top-left"
						placeholder="Search location"
						zoom={8}
						onResult={handleGetSearch}
					/>
					<Marker latitude={Results.latitude} longitude={Results.longitude} offsetTop={-48} offsetLeft={-24}>
						<img src="https://img.icons8.com/color/48/000000/marker.png" alt="marker" />
					</Marker>
				</ReactMapGL>
			</div>
		);
	})
);

SearchCity.wrappedComponent.propTypes = {
	WeatherStore: PropTypes.shape({
		searchResults: PropTypes.shape({
			city: PropTypes.string,
			language: PropTypes.string,
			place: PropTypes.string,
			latitude: PropTypes.number,
			longitude: PropTypes.number
		})
	}).isRequired
};

export default SearchCity;
