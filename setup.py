from setuptools import setup

setup(
    name='Error Propagator',
    version='beta 0.1',
    description='Calculator for symbolical and numeric error propagation',
    license='MIT',
    packages=[
        'app',
        'core',
        'server',
    ],
    install_requires=['sympy', 'flask'],
    zip_safe=False
)
