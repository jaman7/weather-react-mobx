import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

const Span = inject('WeatherStore')(
	observer((props) => {
		const { children, nameClass } = props;

		return <span className={nameClass}>{children}</span>;
	})
);

Span.wrappedComponent.propTypes = {
	nameClass: PropTypes.string,
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Span.wrappedComponent.defaultProps = {
	nameClass: '',
	className: ''
};

export default Span;
