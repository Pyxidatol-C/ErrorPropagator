from flask import Flask, render_template, send_from_directory, request, jsonify
from flask_cors import CORS
from core.IB import Expression
import sympy

app = Flask(__name__,
            static_folder='frontend/build/static',
            template_folder='frontend/build/'
            )
CORS(app)


#########
# Files
#########
@app.route('/', methods=['GET'])
def run_app():
    return render_template('index.html')


@app.route('/favicon.ico')
def send_favicon():
    return send_from_directory('frontend/build', 'favicon.ico')


@app.route('/service-worker.js')
def send_service_worker():
    return send_from_directory('frontend/build', 'service-worker.js')


#######
# API
#######

@app.route('/parse', methods=['POST'])
def get_symbols():
    """Get the symbols in a string expression.

    :return: a json object with the following keys:
             - success: true if the expression was evaluated successfully, false otherwise
             - symbols: a list of the symbols as strings
             - latex: the latex version of the string expression
    """
    str_expr = request.get_json().get('expr')
    try:
        expr = sympy.sympify(str_expr, evaluate=False)
    except Exception as e:
        success = False
        str_symbols = []
        expression = ''
        print(e)
    else:
        success = True
        symbols = expr.atoms(sympy.Symbol)
        str_symbols = sorted([sympy.latex(symbol) for symbol in symbols])
        print(str_symbols)
        expression = sympy.latex(expr)
    return jsonify({
        'success': success,
        'symbols': str_symbols,
        'latex': expression
    })


@app.route('/calculate', methods=['POST'])
def calculate_uncertainties():
    """Evaluate the expression at the given values,
    and calculate the expression and value of the absolute and fractional uncertainties.

    :return: a json object with the following keys:
             - success: true if the calculations were performed without error in time, false otherwise
             - value: the value obtained by evaluating the given expression at the given values
             - absoluteUncertaintyExpr: the expression of the absolute uncertainty
             - absoluteUncertainty: the value of the absolute uncertainty
             - fractionalUncertaintyExpr: the expression of the fractional uncertainty
             - percentageUncertainty: the value of the fractional uncertainty
    :return:
    """
    str_expr = request.get_json().get('expr', '')
    str_args = request.get_json().get('args', [])
    str_vars = request.get_json().get('vars', [])  # positive vars
    values = request.get_json().get('values', {})
    try:
        expr = Expression.from_string(str_args, str_expr)
    except Exception as e:
        print(e)
        return jsonify({
            "success": False,
            "value": "",
            "absoluteUncertaintyExpr": '',
            "absoluteUncertainty": '',
            "fractionalUncertaintyExpr": '',
            "percentageUncertainty": ''
        })
    else:
        assumptions = [sympy.Q.positive(sympy.Symbol(var)) for var in str_vars]
        absolute_uncertainty_expr = expr.calculate_absolute_uncertainty(*assumptions)
        fractional_uncertainty_expr = expr.calculate_fractional_uncertainty(*assumptions)
        return jsonify({
            "success": True,
            "value": sympy.latex(expr.evaluate(values)),
            "absoluteUncertaintyExpr": absolute_uncertainty_expr.to_latex(),
            "absoluteUncertainty": sympy.latex(absolute_uncertainty_expr.evaluate(values)),
            "fractionalUncertaintyExpr": fractional_uncertainty_expr.to_latex(),
            "percentageUncertainty": sympy.latex(fractional_uncertainty_expr.evaluate(values) * 100)
        })


if __name__ == '__main__':
    app.run()
