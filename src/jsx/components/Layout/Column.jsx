import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

const Column = inject('WeatherStore')(
	observer((props) => {
		const { nameClass, children } = props;
		const classnamestring = nameClass.length > 0 ? `${nameClass}` : '';

		return <div className={classnamestring}>{children}</div>;
	})
);
Column.wrappedComponent.propTypes = {
	nameClass: PropTypes.string
};

Column.wrappedComponent.defaultProps = {
	nameClass: ''
};

export default Column;
