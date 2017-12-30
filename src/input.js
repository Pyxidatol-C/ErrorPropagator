import React, {Component} from 'react';
import PropTypes from 'prop-types';


class InputRow extends Component {
    focus() {
        this.input.focus()
    }

    render() {
        return (
            <div className='inputRow'>
                {this.props.prompt}
                <input placeholder={this.props.placeholder}
                       aria-label={this.props.prompt}
                       value={this.props.value}
                       onChange={this.props.handleChange}
                       ref={(input) => {this.input = input}}
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