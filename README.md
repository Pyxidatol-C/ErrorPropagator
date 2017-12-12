# ErrorPropagator
A calculator designed for propagation of uncertainties. 

In the IB physics syllabus, sub-topic 1.2 treats uncertainties and errors. 
Specifically, the following formulae are given:
- If: `y = a ± b`, then: `Δy = Δa + Δb`
- If: `y = ab / c`, then: `Δy / y = Δa / a + Δb / b + Δc / c`
- If: `y = a^n`, then: `Δy / y = |n Δa / a|`

A bit puzzled by how these formulae are derived, I did some investigations to find out
that the IB uses an approximation of the variance formula which assumes independent variables:

```
Δf(x, y, z, ...) = ∑ |∂f / ∂i| Δi, i = x, y, z, ...
```

Using sympy, I built (hopefully) a calculator that propagates the uncertainty using the above formula.
This calculator might come in handy for analysis in lab reports when you have complex equations.

 