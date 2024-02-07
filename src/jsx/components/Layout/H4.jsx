import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

const H4 = inject('WeatherStore')(
	observer((props) => {
		const { nameClass, children } = props;
		const classnamestring = nameClass.length > 0 ? `${nameClass}` : '';

		return <h4 className={classnamestring}>{children}</h4>;
	})
);
H4.wrappedComponent.propTypes = {
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	nameClass: PropTypes.string
};

H4.wrappedComponent.defaultProps = {
	nameClass: ''
};

export default H4;
