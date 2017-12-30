import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Tex} from 'react-tex';


class Description extends Component {
    render() {
        return (
            <div className={this.props.visible ? 'description' : 'hidden'}>
                <br/>
                Welcome!
                <br/>
                This is an IB-styled propagation of uncertainties calculator.
                <br/>
                To use it, simply enter your formula and then the values.
                <br/>
                The source code of this website can be found <a href='https://github.com/JingjieYang/ErrorPropagator'>here on Github</a>.
                <br/>
                (Report any problems / suggestions <a href="https://github.com/JingjieYang/ErrorPropagator/issues">here</a>)
                <br/>
                <br/>
                For maths enthusiasts, IB propagates uncertainties using:
                <br/>
                <Tex texContent='\Delta f(x, y, z, ...)'/>
                <br/>
                <Tex texContent='= \sqrt{(\frac{\partial f}{\partial x})^2 \Delta x^2 + (\frac{\partial f}{\partial y})^2 \Delta y^2 + (\frac{\partial f}{\partial z})^2 \Delta z^2 + ...}'/>
                <br/>
                <Tex texContent='\approx \vert \frac{\partial f}{\partial x} \vert \Delta x + \vert \frac{\partial f}{\partial y} \vert \Delta y + \vert \frac{\partial f}{\partial z} \vert \Delta z + ...'/>
            </div>
        )
    }
}


Description.propTypes = {
    visible: PropTypes.bool
};

export default Description
