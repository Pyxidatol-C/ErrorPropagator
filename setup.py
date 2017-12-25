from setuptools import setup
import sys

if sys.version_info < (3, 5):  # for f-strings
    sys.exit("Sorry, Python >= 3.5 is required.")

setup(
    name='Error Propagator',
    version='0.1',
    description='Calculator for Symbolical and Numeric Propagation of Uncertainties',
    license='MIT',
    author='Jingjie Yang',
    author_email='j.yang19@ejm.org',
    url='http://whatsdelta.herokuapp.com/',
    python_requires='',
    packages=[
        'core',
        'frontend',
    ],
    install_requires=['flask', 'flask-cors', 'gunicorn', 'sympy'],
    zip_safe=False
)
