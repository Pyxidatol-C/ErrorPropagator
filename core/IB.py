import sympy
from sympy.assumptions.assume import AppliedPredicate, global_assumptions
from typing import Dict, List, Union

a, b, c = sympy.symbols('a b c')
d_a, d_b, d_c = sympy.symbols('Δa Δb Δc')


class Expression:
    args: List[sympy.Symbol]
    expr: sympy.Expr

    def __init__(self, args: List[sympy.Symbol], expr: sympy.Expr):
        """Initialize an Expression instance with a sympy expression and its arguments.

        :param args: the variables in the expression
        :param expr: the mathematical expression

        >>> Expression([a, b, c], a + b + c)
        f(a, b, c) = a + b + c
        >>> Expression([a, b, c], a * b / c)
        f(a, b, c) = a*b/c
        >>> Expression([a, b, c], sympy.root(a ** b, c))
        f(a, b, c) = (a**b)**(1/c)
        """
        self.args = args
        self.expr = expr

    def __repr__(self) -> str:
        """Show this expression as a mathematical function.

        :rtype str

        >>> str(Expression([a], a * sympy.pi))
        'f(a) = pi*a'
        >>> repr(Expression([], sympy.E))
        'f() = E'
        """
        if len(self.args) == 1:
            return f"f({self.args[0]}) = {self.expr}"
        return f"f{tuple(self.args)} = {self.expr}"

    def evaluate(self, values: Dict[Union[str, sympy.Symbol], float], precision: int =3) -> sympy.Expr:
        """Evaluate the expression with the given values.

        :param values: a dictionary mapping all the sympy symbols in the args to numeric values
        :param precision: the number of digits in the results
        :return: the result of the evaluation as an sympy expression

        >>> Expression([a, b, c], a + b + c).evaluate({a: 1, b: 2, c: 3})
        6.00
        >>> Expression([a, b, c], a ** b + c).evaluate({'a': c, 'b': 1})
        2.0*c
        """
        return self.expr.subs(values).evalf(precision)

    def calculate_absolute_uncertainty(self, *assumptions: List[AppliedPredicate],
                                       refine: bool = False,
                                       delta_char: str = '\\Delta ') -> 'Expression':
        """Calculate the absolute uncertainty in the expression, assuming all args given are independent.

        :return: the absolute uncertainty of this expression
        :rtype: Expression

        >>> Expression([a], c * a).calculate_absolute_uncertainty(sympy.Q.positive(c), refine=True, delta_char='Δ')
        f(Δa) = c*Δa
        >>> Expression([a, b, c], a + b - c).calculate_absolute_uncertainty(refine=True, delta_char='Δ')
        f(Δa, Δb, Δc) = Δa + Δb + Δc
        """
        uncertainty_expr = sympy.Integer(0)  # just in case
        uncertainty_args = []
        global_assumptions.add(*assumptions)

        for var in self.args:
            d_var = sympy.Symbol(delta_char + sympy.latex(var))
            uncertainty_args.append(d_var)
            uncertainty_expr += sympy.Abs(self.expr.diff(var)) * d_var
            global_assumptions.add(sympy.Q.positive(var))
        if refine:
            uncertainty_expr = sympy.refine(uncertainty_expr)
        global_assumptions.clear()
        return Expression(uncertainty_args, uncertainty_expr)

    def calculate_fractional_uncertainty(self, *assumptions: List[AppliedPredicate],
                                         refine: bool = False,
                                         delta_char: str = '\\Delta ') -> 'Expression':
        """Calculate the absolute uncertainty in the expression, assuming all args given are independent.

        :return: the fractional uncertainty of this expression
        :rtype: Expression

        >>> Expression([a, b, c], a * b / c).calculate_fractional_uncertainty(refine=True, delta_char='Δ')
        f(Δa, Δb, Δc) = Δc/c + Δb/b + Δa/a
        >>> Expression([a], a ** b).calculate_fractional_uncertainty(sympy.Q.positive(b), refine=True, delta_char='Δ')
        f(Δa) = b*Δa/a
        """
        absolute_uncertainty = self.calculate_absolute_uncertainty(*assumptions, refine=refine, delta_char=delta_char)
        frac_uncertainty_expr = sympy.Integer(0)
        if type(absolute_uncertainty.expr) == sympy.Add:
            for addend in absolute_uncertainty.expr.args:
                frac_uncertainty_expr += addend / self.expr
        elif type(absolute_uncertainty.expr) == sympy.Mul or type(absolute_uncertainty) == sympy.Pow:
            frac_uncertainty_expr = absolute_uncertainty.expr / self.expr
        else:
            frac_uncertainty_expr = sympy.Mul(absolute_uncertainty.expr, sympy.Pow(self.expr, -1), evaluate=False)
        return Expression(absolute_uncertainty.args, frac_uncertainty_expr)

    def to_latex(self) -> str:
        r"""Get the latex form of this expression.

        :rtype: str

        >>> Expression([a, b, c], a + b + c).to_latex()
        'a + b + c'
        >>> Expression([a, b, c], a * b / c).to_latex()
        '\\frac{a b}{c}'
        >>> Expression([a, b, c], sympy.root(a ** b, c)).to_latex()
        '\\left(a^{b}\\right)^{\\frac{1}{c}}'
        """
        return sympy.latex(self.expr)

    @classmethod
    def from_string(cls, args_list: List[str], string: str, ) -> 'Expression':
        """Parse a string expression.

        :param string: expression as a string of python expressions
        :param args_list: the list of args / independent variables of the expression as strings
        :return: an expression taking in the given args

        >>> Expression.from_string(['x'], 'sqrt(x) ^ y')
        f(x) = (sqrt(x))**y
        """
        parsed_expr = sympy.sympify(string, evaluate=False)  # note: uses eval
        args = [symbol for symbol in parsed_expr.atoms(sympy.Symbol) if str(symbol) in args_list]
        return cls(args, parsed_expr)
