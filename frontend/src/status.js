import React, {Component} from 'react';
import PropTypes from 'prop-types';


class StatusIndicator extends Component {
    render() {
        return (
            <div style={{
                height: 64,
                width: 64,
                backgroundColor: {0: 'mediumSeaGreen', 1: 'indianRed', 2: 'sandyBrown'}[this.props.statusCode],
                transition: 'background-color 0.5s'
            }}/>
        )
    }
}

StatusIndicator.propTypes = {
    statusCode: PropTypes.number.isRequired
};


export default StatusIndicator;
