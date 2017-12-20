import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as Latex from 'react-latex';
import './input.css'


class InputRow extends Component {
    constructor() {
        super(...arguments);
        this.state = {}
    }

    render() {
        return (
            <div className='inputRow'>
                <Latex>{'$' + this.props.prompt + '$'}</Latex>
                <input placeholder={this.props.placeholder}
                       value={this.props.value}
                       onChange={this.props.handleChange}
                />
            </div>
        )
    }
}

InputRow.propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string.isRequired,
    prompt: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired
};


export default InputRow