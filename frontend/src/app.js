import React, {Component} from 'react';
import update from 'immutability-helper';
import 'whatwg-fetch';
import InputRow from "./input";
import * as Latex from 'react-latex';
import './app.css';


class App extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            inputExpression: '',
            // symbols with an associated uncertainty
            inputArgs: {
                /* Example entry
                x: {
                    value: 1.0,
                    absoluteUncertainty: 0.01,
                    percentageUncertainty: 1
                }
                 */
            },
            // symbols that don't have an uncertainty
            inputVars: {
                /* Example entry
                y: {
                    positive: false,
                    value: -3.14
                }
                 */
            },
            outputExpression: '',
            outputValue: '',
            outputAbsoluteUncertaintyExpression: '',
            outputAbsoluteUncertainty: '',
            outputFractionalUncertaintyExpression: '',
            outputPercentageUncertainty: '',
            mode: 'IB',
            success: true
        }
    }

    handleInputExpressionChange(e) {
        let expression = e.target.value;
        this.setState(
            update(this.state, {
                inputExpression: {$set: expression}
            })
        );

        fetch('/parse', {
            method: "POST",
            body: JSON.stringify({expr: expression}),
            headers: {
                "Content-type": "application/json"
            },
            credentials: "same-origin"
        })
            .then((response) => response.json())
            .then((responseData) => this.setState(
                update(this.state, {
                    success: {$set: responseData['success']},
                    inputArgs: {
                        $set: responseData['symbols'].reduce((o, key) => ({
                            ...o,
                            [key]: {value: 0, absoluteUncertainty: 0, percentageUncertainty: 0}
                        }), {})
                    },
                    outputExpression: {$set: responseData['expression']},
                })
            ))
    }

    render() {
        return (
            <div>
                <h1>+-ERROR PROPAGATION*/</h1>
                <InputRow value={this.state.inputExpression}
                          prompt={"y="}
                          placeholder='a + b + c'
                          handleChange={this.handleInputExpressionChange.bind(this)}
                />
                <Latex>{'$' + this.state.outputExpression + '$'}</Latex>
                <div className={this.state.success ? 'statusOk' : 'statusError'}>*</div>
                <p>{JSON.stringify(this.state.inputArgs)}</p>
            </div>
        )
    }
}


export default App;
