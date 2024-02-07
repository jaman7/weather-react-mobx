import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

const H2 = inject('WeatherStore')(
	observer((props) => {
		const { nameClass, children } = props;
		const classnamestring = nameClass.length > 0 ? `${nameClass}` : '';

		return <h2 className={classnamestring}>{children}</h2>;
	})
);
H2.wrappedComponent.propTypes = {
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	nameClass: PropTypes.string
};

H2.wrappedComponent.defaultProps = {
	nameClass: ''
};

export default H2;
