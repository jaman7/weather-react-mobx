import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

const H3 = inject('WeatherStore')(
	observer((props) => {
		const { nameClass, children } = props;
		const classnamestring = nameClass.length > 0 ? `${nameClass}` : '';

		return <h3 className={classnamestring}>{children}</h3>;
	})
);
H3.wrappedComponent.propTypes = {
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	nameClass: PropTypes.string
};

H3.wrappedComponent.defaultProps = {
	nameClass: ''
};

export default H3;
