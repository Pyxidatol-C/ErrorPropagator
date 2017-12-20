from core.IB import Expression
from flask import Flask, render_template, send_from_directory, request, jsonify
import sympy

app = Flask(__name__,
            static_folder='frontend/build/static',
            template_folder='frontend/build/'
            )


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
    str_expr = request.get_json().get('expr')
    try:
        expr = sympy.sympify(str_expr)
    except sympy.SympifyError:
        success = False
        str_symbols = []
        expression = ''
    else:
        success = True
        symbols = expr.atoms(sympy.Symbol)
        str_symbols = [str(symbol) for symbol in symbols]
        expression = sympy.latex(expr)
    return jsonify({
        'success': success,
        'symbols': str_symbols,
        'expression': expression
    })


@app.route('/uncertainty', methods=['POST'])
def calculate_uncertainty():
    str_expr = request.get_json().get('expr')
    str_args = request.get_json().get('args', [])
    str_vars = request.get_json().get('vars', [])  # positive vars
    values = request.get_json().get('values')
    try:
        expr = Expression.from_string(str_args, str_expr)
    except sympy.SympifyError:
        return jsonify({
            "success": False,
            "absoluteUncertaintyExpr": '',
            "absoluteUncertainty": '',
            "fractionalUncertaintyExpr": '',
            "fractionalUncertainty": ''
        })
    else:
        assumptions = [sympy.Q.positive(sympy.Symbol(var)) for var in str_vars]
        absolute_uncertainty_expr = expr.calculate_absolute_uncertainty(*assumptions)
        fractional_uncertainty_expr = expr.calculate_fractional_uncertainty(*assumptions)
        return jsonify({
            "success": True,
            "absoluteUncertaintyExpr": absolute_uncertainty_expr.to_latex(),
            "absoluteUncertainty": sympy.latex(absolute_uncertainty_expr.evaluate(values)),
            "fractionalUncertaintyExpr": fractional_uncertainty_expr.to_latex(),
            "fractionalUncertainty": sympy.latex(fractional_uncertainty_expr.evaluate(values) * 100)
        })


if __name__ == '__main__':
    app.run()
