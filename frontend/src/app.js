import React, {Component} from 'react';
import update from 'immutability-helper';
import 'whatwg-fetch';
import InputRow from "./input";
import LatexDisplay from "./display";
import Header from "./header";
import StatusIndicator from "./status";


class App extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            inputExpression: '',
            inputArgs: {
                /* Symbols with an associated uncertainty
                x: {
                    latex: 'x',
                    value: 1.0,
                    absoluteUncertainty: 0.01,
                    percentageUncertainty: 1
                }
                 */
                /* Symbols without associated uncertainty
               y: {
                   latex: 'y',
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
            status: 0,
            timeout: 300
        }
    }

    lastEdited = new Date();

    handleInputExpressionChange(e) {
        const THIS_EDIT = this.lastEdited = new Date();
        let expression = e.target.value;
        this.setState(
            update(this.state, {
                inputExpression: {$set: expression},
                inputArgs: {$set: {}},
                outputExpression: {$set: ''},
                outputValue: {$set: ''},
                outputAbsoluteUncertaintyExpression: {$set: ''},
                outputAbsoluteUncertainty: {$set: ''},
                outputFractionalUncertaintyExpression: {$set: ''},
                outputPercentageUncertainty: {$set: ''},
                status: {$set: 2}
            })
        );

        setTimeout(() => {
            if (this.lastEdited > THIS_EDIT) {
                return;
            }

            fetch('/parse', {
                method: "POST",
                body: JSON.stringify({"expr": expression}),
                headers: {
                    "Content-type": "application/json"
                },
            })
                .then((response) => response.json())
                .then((responseData) => this.setState(
                    update(this.state, {
                        status: {$set: responseData['success'] ? 0 : 1},
                        inputArgs: {
                            $set: responseData['symbols'].reduce((o, key) => ({
                                ...o,
                                [key[0]]: {
                                    latex: key[1],
                                    value: '',
                                    absoluteUncertainty: '',
                                    percentageUncertainty: ''
                                }
                            }), {})
                        },
                        outputExpression: {$set: responseData['latex']},
                    })
                ))
        }, this.state.timeout)
    }

    handleInputArgValueChange(e, symbol, changeType) {
        let value = this.state.inputArgs[symbol].value,
            absoluteUncertainty = this.state.inputArgs[symbol].absoluteUncertainty,
            percentageUncertainty = this.state.inputArgs[symbol].percentageUncertainty;

        const THIS_EDIT = this.lastEdited = new Date();

        if (changeType === 'value') {
            value = e.target.value;
            absoluteUncertainty = '';
            percentageUncertainty = '';
        }
        if (changeType === 'absoluteUncertainty') {
            absoluteUncertainty = e.target.value;
            if (!isNaN(parseFloat(value)) && !isNaN(parseFloat(absoluteUncertainty))) {
                percentageUncertainty = absoluteUncertainty / value * 100;
            } else {
                percentageUncertainty = '';
            }
        }
        if (changeType === 'percentageUncertainty') {
            percentageUncertainty = e.target.value;
            if (!isNaN(parseFloat(value)) && !isNaN(parseFloat(percentageUncertainty))) {
                absoluteUncertainty = percentageUncertainty * value / 100;
            } else {
                absoluteUncertainty = '';
            }
        }

        this.setState(
            update(this.state, {
                inputArgs: {
                    [symbol]: {
                        value: {$set: value},
                        absoluteUncertainty: {$set: absoluteUncertainty},
                        percentageUncertainty: {$set: percentageUncertainty}
                    }
                },
                status: {$set: [value, absoluteUncertainty, percentageUncertainty].some(isNaN) ? 1 : 2}
            })
        );

        setTimeout(() => {
            if (this.lastEdited > THIS_EDIT) {
                return;
            }

            let values = Object.keys(this.state.inputArgs).reduce((o, x) => ({
                ...o,
                [x]: x !== symbol ? parseFloat(this.state.inputArgs[x].value) : parseFloat(value),
                ['\\Delta ' + x]: x !== symbol ? parseFloat(this.state.inputArgs[x].absoluteUncertainty) : parseFloat(absoluteUncertainty)
            }), {});

            values = Object.keys(values)
                .filter((x) => !isNaN(values[x]))
                .reduce((o, x) => ({...o, [x]: values[x]}), {});

            fetch(' /calculate', {
                method: "POST",
                body: JSON.stringify({
                    "expr": this.state.inputExpression,
                    "args": Object.keys(this.state.inputArgs).filter(
                        (x) => x !== symbol ? this.state.inputArgs[x].absoluteUncertainty : absoluteUncertainty
                    ),
                    "vars": Object.keys(this.state.inputArgs).filter(
                        (x) => x !== symbol ? this.state.inputArgs[x].value >= 0 : value >= 0
                    ),
                    "values": Object.keys(values)
                        .filter((x) => !isNaN(values[x]))
                        .reduce((o, x) => ({...o, [x]: values[x]}), {}),
                    "refine": true
                }),
                headers: {
                    "Content-type": "application/json"
                }
            })
                .then((response) => response.json())
                .then(
                    (responseData) => this.setState(
                        update(this.state, {
                            status: {
                                $set: [value, absoluteUncertainty, percentageUncertainty].some(isNaN) ?
                                    1 : responseData.success ? 0 : 1
                            },
                            outputValue: {$set: responseData['value']},
                            outputAbsoluteUncertainty: {$set: responseData['absoluteUncertainty']},
                            outputAbsoluteUncertaintyExpression: {$set: responseData['absoluteUncertaintyExpr']},
                            outputPercentageUncertainty: {$set: responseData['percentageUncertainty'] + '\\%'},
                            outputFractionalUncertaintyExpression: {$set: responseData['fractionalUncertaintyExpr']}
                        })
                    ),
                    () => fetch(' /calculate', {
                        method: "POST",
                        body: JSON.stringify({
                            "expr": this.state.inputExpression,
                            "args": Object.keys(this.state.inputArgs).filter(
                                (x) => x !== symbol ? this.state.inputArgs[x].absoluteUncertainty : absoluteUncertainty
                            ),
                            "vars": Object.keys(this.state.inputArgs).filter(
                                (x) => x !== symbol ? this.state.inputArgs[x].value >= 0 : value >= 0
                            ),
                            "values": Object.keys(values)
                                .filter((x) => !isNaN(values[x]))
                                .reduce((o, x) => ({...o, [x]: values[x]}), {}),
                            "refine": false
                        }),
                        headers: {
                            "Content-type": "application/json"
                        }
                    })
                        .then((response) => response.json())
                        .then((responseData) => this.setState(
                            update(this.state, {
                                status: {
                                    $set: [value, absoluteUncertainty, percentageUncertainty].some(isNaN) ?
                                        1 : responseData.success ? 0 : 1
                                },
                                outputValue: {$set: responseData['value']},
                                outputAbsoluteUncertainty: {$set: responseData['absoluteUncertainty']},
                                outputAbsoluteUncertaintyExpression: {$set: responseData['absoluteUncertaintyExpr']},
                                outputPercentageUncertainty: {$set: responseData['percentageUncertainty'] + '\\%'},
                                outputFractionalUncertaintyExpression: {$set: responseData['fractionalUncertaintyExpr']}
                            })
                        ))
                )
        }, this.state.timeout)
    }

    render() {
        return (
            <div>
                <Header/>
                <StatusIndicator statusCode={this.state.status}/>
                <hr/>

                <InputRow value={this.state.inputExpression}
                          prompt={"y="}
                          placeholder='a + b + c'
                          handleChange={this.handleInputExpressionChange.bind(this)}/>
                <hr/>

                <LatexDisplay contents={['y', this.state.outputExpression, this.state.outputValue]}
                              minItemsRequired={2}/>
                <LatexDisplay
                    contents={['\\Delta y', this.state.outputAbsoluteUncertaintyExpression, this.state.outputAbsoluteUncertainty]}
                    minItemsRequired={2}/>
                <LatexDisplay
                    contents={['\\frac{\\Delta y}{y}', this.state.outputFractionalUncertaintyExpression, this.state.outputPercentageUncertainty]}
                    minItemsRequired={2}/>

                <table style={{
                    display: Object.keys(this.state.inputArgs).length > 0 ? 'unset' : 'none',
                }}>
                    <thead>
                    <tr>
                        <th/>
                        <th><LatexDisplay contents={['x']}/></th>
                        <th><LatexDisplay contents={['\\Delta x']}/></th>
                        <th><LatexDisplay contents={['\\frac{\\Delta x}{x}']}/></th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.keys(this.state.inputArgs).map((x) => {
                        return (
                            <tr key={x}>
                                <th><LatexDisplay contents={[this.state.inputArgs[x].latex]}/></th>
                                <td>
                                    <input value={this.state.inputArgs[x].value}
                                           onChange={(e) => this.handleInputArgValueChange(e, x, 'value')}/>
                                </td>
                                <td>
                                    <input value={this.state.inputArgs[x].absoluteUncertainty}
                                           onChange={(e) => this.handleInputArgValueChange(e, x, 'absoluteUncertainty')}/>
                                </td>
                                <td>
                                    <input value={this.state.inputArgs[x].percentageUncertainty}
                                           onChange={(e) => this.handleInputArgValueChange(e, x, 'percentageUncertainty')}/>
                                    %
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        )
    }
}


export default App;
