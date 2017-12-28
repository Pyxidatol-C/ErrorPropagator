import React, {Component} from 'react';
import * as Latex from 'react-latex';
import PropTypes from 'prop-types';


class LatexDisplay extends Component {
    render() {
        let contents = this.props.contents.filter((x) => x);
        contents = contents.length >= (this.props.minItemsRequired || 1) ? contents.join(this.props.connector || ' = ') : '';
        return <span style={{display: "block"}}><Latex>{contents ? '$' + contents + '$' : ''}</Latex></span>
    }
}

LatexDisplay.propTypes = {
    contents: PropTypes.arrayOf(PropTypes.string),
    connector: PropTypes.string,
    minItemsRequired: PropTypes.number
};

export default LatexDisplay;
