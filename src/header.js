import React, {Component} from 'react';
import PropTypes from 'prop-types';


class Header extends Component {
    render() {
        return (
            <div className={'header ' + {0: 'ok', 1: 'error', 2: 'loading'}[this.props.status]}>
                誤差幾何？
            </div>
        )
    }
}

Header.propTypes = {
    status: PropTypes.number
};


export default Header
