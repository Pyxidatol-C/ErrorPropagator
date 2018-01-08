import React, {Component} from 'react';
import update from 'immutability-helper';
import 'whatwg-fetch';
import InputRow from "./input";
import LatexDisplay from "./display";
import Header from "./header";
import round from './rounding';
import './app.css';
import Description from "./description";


const SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:5000';


class App extends Component {
    lastEdited = new Date();

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
            settings: {
                clicked: false,
                visible: false,
                reset: false,
                constants: false,
                timeout: 300,
                prec: 3
            }
        }
    }

    componentDidMount() {
        const paramGetter = new URL(window.location.href);
        const expr = decodeURIComponent(window.location.pathname.split('/')[1]);
        this.fromUrl(expr, paramGetter);
        this.exprInput.focus();
    }

    componentDidUpdate() {
        this.toUrl();
    }

    fromUrl(expr, paramGetter) {
        this.setState(update(this.state, {
                inputExpression: {$set: expr},
                status: {$set: 2},
                settings: {
                    constants: {$set: !!paramGetter.searchParams.get('USE_CONSTANTS')}
                }
            }), () => fetch(SERVER_URL + '/parse', {
                method: "POST",
                body: JSON.stringify({
                    "expr": expr,
                    "use_constants": this.state.settings.constants
                }),
                headers: {
                    "Content-type": "application/json"
                },
            })
                .then((response) => response.json())
                .then((responseData) => this.setState(
                    update(this.state, {
                        status: {$set: responseData['success'] ? 0 : expr ? 1 : 0},
                        inputArgs: {
                            $set: responseData['symbols'].reduce((o, key) => ({
                                ...o,
                                [key[0]]: {
                                    latex: key[1],
                                    value: paramGetter.searchParams.get(key[0]) || '',
                                    absoluteUncertainty: paramGetter.searchParams.get('Δ' + key[0]) || '',
                                    percentageUncertainty: paramGetter.searchParams.get('%Δ' + key[0]) || ''
                                }
                            }), {})
                        },
                        outputExpression: {$set: responseData['latex']},
                    }),
                    () => {
                        if (expr && window.location.href.includes('?')) {
                            this.handleInputArgValueChange('', '', 'load')
                        }
                    }
                ), () => this.setState(update(this.state, {status: {$set: 1}})))
        )

    }

    toUrl() {
        const valuesParameters = Object.keys(this.state.inputArgs)
            .reduce((array, x) => {
                const value = this.state.inputArgs[x].value,
                    delta = this.state.inputArgs[x].absoluteUncertainty,
                    fracDelta = this.state.inputArgs[x].percentageUncertainty;
                if (value.length) {
                    array.push(`${x}=${value}`);
                }
                if (delta.length) {
                    array.push(`Δ${x}=${delta}`)
                }
                if (fracDelta.length) {
                    array.push(`%Δ${x}=${fracDelta}`)
                }
                return array
            }, this.state.settings.constants ? ['USE_CONSTANTS=true'] : [])
            .join('&');
        window.history.pushState(
            {expr: this.state.inputExpression, values: this.state.inputArgs},
            `误差 | ${this.state.inputExpression}`,
            '/' + encodeURIComponent(this.state.inputExpression) + (valuesParameters.length ? ('?' + valuesParameters) : '')
        )
    }

    handleInputExpressionChange(expression) {
        const THIS_EDIT = this.lastEdited = new Date();
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
            }),
            () => setTimeout(() => {
                // this.toUrl();
                if (this.lastEdited > THIS_EDIT) {
                    return;
                }

                fetch(SERVER_URL + '/parse', {
                    method: "POST",
                    body: JSON.stringify({
                        "expr": expression,
                        "use_constants": this.state.settings.constants
                    }),
                    headers: {
                        "Content-type": "application/json"
                    },
                })
                    .then((response) => response.json())
                    .then((responseData) => this.setState(
                        update(this.state, {
                            status: {$set: responseData['success'] ? 0 : expression ? 1 : 0},
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
                    ), () => this.setState(update(this.state, {status: {$set: 1}})))
            }, this.state.settings.timeout)
        )
    }

    handleInputArgValueChange(inputValue, symbol, changeType) {
        let value, absoluteUncertainty, percentageUncertainty;
        const THIS_EDIT = this.lastEdited = new Date();
        if (changeType !== 'load') {
            value = this.state.inputArgs[symbol].value;
            absoluteUncertainty = this.state.inputArgs[symbol].absoluteUncertainty;
            percentageUncertainty = this.state.inputArgs[symbol].percentageUncertainty;


            if (changeType === 'value') {
                // TODO keep record of whether absolute or percentage uncertainty is last updated, and update the other
                value = inputValue;
                absoluteUncertainty = '';
                percentageUncertainty = '';
            }
            if (changeType === 'absoluteUncertainty') {
                absoluteUncertainty = inputValue;
                if (!isNaN(parseFloat(value)) && !isNaN(parseFloat(absoluteUncertainty))) {
                    percentageUncertainty = round(absoluteUncertainty / value * 100, this.state.settings.prec);
                } else {
                    percentageUncertainty = '';
                }
            }
            if (changeType === 'percentageUncertainty') {
                percentageUncertainty = inputValue;
                if (!isNaN(parseFloat(value)) && !isNaN(parseFloat(percentageUncertainty))) {
                    absoluteUncertainty = round(percentageUncertainty * value / 100, this.state.settings.prec);
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
            )
        }

        setTimeout(() => {
            if (this.lastEdited > THIS_EDIT) {
                return;
            }

            let values = Object.keys(this.state.inputArgs).reduce((o, x) => ({
                ...o,
                [x]: x !== symbol ? parseFloat(this.state.inputArgs[x].value) : parseFloat(value),
                ['\\Delta ' + this.state.inputArgs[x].latex]: x !== symbol ? parseFloat(this.state.inputArgs[x].absoluteUncertainty) : parseFloat(absoluteUncertainty)
            }), {});

            values = Object.keys(values)
                .filter((x) => !isNaN(values[x]))
                .reduce((o, x) => ({...o, [x]: values[x]}), {});

            fetch(SERVER_URL + '/calculate', {
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
                    "prec": this.state.settings.prec,
                    "refine": true,
                    "use_constants": this.state.settings.constants
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
                                $set: [value, absoluteUncertainty, percentageUncertainty].some(isNaN) && changeType !== 'load' ?
                                    1 : responseData.success ? 0 : 1
                            },
                            outputValue: {$set: responseData['value']},
                            outputAbsoluteUncertainty: {$set: responseData['absoluteUncertainty']},
                            outputAbsoluteUncertaintyExpression: {$set: responseData['absoluteUncertaintyExpr']},
                            outputPercentageUncertainty: {$set: responseData['percentageUncertainty'] + '\\%'},
                            outputFractionalUncertaintyExpression: {$set: responseData['fractionalUncertaintyExpr']}
                        })
                    ),
                    () => fetch(SERVER_URL + '/calculate', {
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
                            "prec": this.state.prec,
                            "refine": false,
                            "use_constants": this.state.settings.constants
                        }),
                        headers: {
                            "Content-type": "application/json"
                        }
                    })
                        .then((response) => response.json())
                        .then((responseData) => this.setState(
                            update(this.state, {
                                status: {
                                    $set: [value, absoluteUncertainty, percentageUncertainty].some(isNaN) && changeType !== 'load' ?
                                        1 : responseData.success ? 0 : 1
                                },
                                outputValue: {$set: responseData['value']},
                                outputAbsoluteUncertainty: {$set: responseData['absoluteUncertainty']},
                                outputAbsoluteUncertaintyExpression: {$set: responseData['absoluteUncertaintyExpr']},
                                outputPercentageUncertainty: {$set: responseData['percentageUncertainty'] + '\\%'},
                                outputFractionalUncertaintyExpression: {$set: responseData['fractionalUncertaintyExpr']}
                            })
                        ), () => this.setState(update(this.state, {status: {$set: 1}})))
                )
        }, changeType === 'load' ? 0 : this.state.settings.timeout)
    }

    render() {
        return (
            <div>
                <Header status={this.state.status}/>
                <hr/>
                <InputRow value={this.state.inputExpression}
                          ref={(exprInput) => {this.exprInput = exprInput}}
                          prompt={"y="}
                          placeholder='a + b + c'
                          handleChange={(e) => this.handleInputExpressionChange(e.target.value)}/>
                <hr/>

                <LatexDisplay contents={['y', this.state.outputExpression, this.state.outputValue]}
                              minItemsRequired={2}/>
                <LatexDisplay
                    contents={['\\Delta y', this.state.outputAbsoluteUncertaintyExpression, this.state.outputAbsoluteUncertainty]}
                    minItemsRequired={2}/>
                <LatexDisplay
                    contents={['\\frac{\\Delta y}{y}', this.state.outputFractionalUncertaintyExpression, this.state.outputPercentageUncertainty]}
                    minItemsRequired={2}/>

                <table className={Object.keys(this.state.inputArgs).length > 0 ? '' : 'hidden'}>
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
                                           aria-label={"value of " + x}
                                           onChange={(e) => this.handleInputArgValueChange(e.target.value, x, 'value')}/>
                                </td>
                                <td>
                                    <input value={this.state.inputArgs[x].absoluteUncertainty}
                                           aria-label={"absolute uncertainty of " + x}
                                           onChange={(e) => this.handleInputArgValueChange(e.target.value, x, 'absoluteUncertainty')}/>
                                </td>
                                <td>
                                    <input value={this.state.inputArgs[x].percentageUncertainty}
                                           aria-label={"percentage uncertainty of " + x}
                                           onChange={(e) => this.handleInputArgValueChange(e.target.value, x, 'percentageUncertainty')}/>
                                    %
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
                <button
                    onClick={() => {
                        this.setState(update(this.state, {
                            settings: {
                                visible: {$set: !this.state.settings.visible},
                                clicked: {$set: true}
                            }
                        }));
                        setTimeout(() => this.setState(update(this.state, {settings: {clicked: {$set: false}}})), 500);
                    }}
                >
                    <div className={this.state.settings.clicked ? 'rotate' : ''}>
                        &#9881;
                    </div>
                </button>
                <table className={(this.state.settings.visible ? '' : 'hidden') + ' settings'}>
                    <thead>
                    <tr>
                        <th>Precision</th>
                        <th>Lag</th>
                        <th>Constants</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td><input value={this.state.settings.prec}
                                   type="range"
                                   min="1"
                                   max="8"
                                   onChange={(e) =>
                                       this.setState(update(this.state, {
                                           settings: {
                                               prec: {
                                                   $set: e.target.value
                                               }
                                           }
                                       }))
                                   }/></td>
                        <td><input value={this.state.settings.timeout / 1000}
                                   type="range"
                                   min="0"
                                   max="1"
                                   step="0.1"
                                   onChange={(e) =>
                                       this.setState(update(this.state, {
                                           settings: {
                                               timeout: {
                                                   $set: e.target.value * 1000
                                               }
                                           }
                                       }))}
                        /></td>
                        <td><input checked={this.state.settings.constants}
                                   type="checkbox"
                                   onClick={() => this.setState(update(this.state, {
                                       settings: {
                                           constants: {
                                               $set: !this.state.settings.constants
                                           }
                                       }
                                   }), () => window.location.reload())}
                        /></td>
                    </tr>
                    <tr>
                        <td>{this.state.settings.prec}</td>
                        <td>{this.state.settings.timeout / 1000} sec</td>
                        <td className={this.state.settings.reset ? 'rotate' : ''}
                            onClick={() => {
                                const resetConstantUse = this.state.settings.constants;
                                this.setState(update(this.state, {
                                        settings: {
                                            prec: {
                                                $set: 3
                                            },
                                            timeout: {
                                                $set: 300
                                            },
                                            constants: {
                                                $set: false
                                            },
                                            reset: {
                                                $set: true
                                            }
                                        }
                                    }
                                ), () => resetConstantUse ? window.location.reload() : null);
                                setTimeout(() => this.setState(update(this.state, {settings: {reset: {$set: false}}})), 500)
                            }}>
                            &#8635;
                        </td>
                    </tr>
                    </tbody>
                </table>
                <Description visible={Object.keys(this.state.inputArgs).length === 0}/>
            </div>
        )
    }
}


export default App;
