import sympy
from typing import Any
from sympy.core.numbers import Float, pi

# YES THIS SHOULD BE PUT IN A JSON FILE
# NO THERE CAN'T BE MORE JS CODE THAN PYTHON CODE IN MY REPO
ATOMIC_MASSES = {  # taken from IB chemistry data booklet
    'H': 1.01,  # Hydrogen
    'He': 4.0,  # Helium
    'Li': 6.94,  # Lithium
    'Be': 9.01,  # Beryllium
    'B': 10.81,  # Boron
    'C': 12.01,  # Carbon
    'N': 14.01,  # Nitrogen
    'O': 16.0,  # Oxygen
    'F': 19.0,  # Fluorine
    'Ne': 20.18,  # Neon
    'Na': 22.99,  # Sodium
    'Mg': 24.3,  # Magnesium
    'Al': 26.98,  # Aluminium
    'Si': 28.09,  # Silicon
    'P': 30.97,  # Phosphorus
    'S': 32.06,  # Sulfur
    'Cl': 35.45,  # Chlorine
    'Ar': 39.95,  # Argon
    'K': 39.1,  # Potassium
    'Ca': 40.08,  # Calcium
    'Sc': 44.96,  # Scandium
    'Ti': 47.87,  # Titanium
    'V': 50.94,  # Vanadium
    'Cr': 52.0,  # Chromium
    'Mn': 54.94,  # Manganese
    'Fe': 55.85,  # Iron
    'Co': 58.93,  # Cobalt
    'Ni': 58.69,  # Nickel
    'Cu': 63.55,  # Copper
    'Zn': 65.38,  # Zinc
    'Ga': 69.72,  # Gallium
    'Ge': 72.63,  # Germanium
    'As': 74.92,  # Arsenic
    'Se': 78.97,  # Selenium
    'Br': 79.9,  # Bromine
    'Kr': 83.8,  # Krypton
    'Rb': 85.47,  # Rubidium
    'Sr': 87.62,  # Strontium
    'Y': 88.91,  # Yttrium
    'Zr': 91.22,  # Zirconium
    'Nb': 92.91,  # Niobium
    'Mo': 95.95,  # Molybdenum
    'Tc': 98,  # Technetium
    'Ru': 101.07,  # Ruthenium
    'Rh': 102.91,  # Rhodium
    'Pd': 106.42,  # Palladium
    'Ag': 107.87,  # Silver
    'Cd': 112.41,  # Cadmium
    'In': 114.82,  # Indium
    'Sn': 118.71,  # Tin
    'Sb': 121.76,  # Antimony
    'Te': 127.6,  # Tellurium
    'I': 126.9,  # Iodine
    'Xe': 131.29,  # Xenon
    'Cs': 132.91,  # Cesium
    'Ba': 137.33,  # Barium
    'La': 138.91,  # Lanthanum
    'Ce': 140.12,  # Cerium
    'Pr': 140.91,  # Praseodymium
    'Nd': 144.24,  # Neodymium
    'Pm': 145,  # Promethium
    'Sm': 150.36,  # Samarium
    'Eu': 151.96,  # Europium
    'Gd': 157.25,  # Gadolinium
    'Tb': 158.93,  # Terbium
    'Dy': 162.5,  # Dysprosium
    'Ho': 164.93,  # Holmium
    'Er': 167.26,  # Erbium
    'Tm': 168.93,  # Thulium
    'Yb': 173.05,  # Ytterbium
    'Lu': 174.97,  # Lutetium
    'Hf': 178.49,  # Hafnium
    'Ta': 180.95,  # Tantalum
    'W': 183.84,  # Tungsten
    'Re': 186.21,  # Rhenium
    'Os': 190.23,  # Osmium
    'Ir': 192.22,  # Iridium
    'Pt': 195.08,  # Platinum
    'Au': 196.97,  # Gold
    'Hg': 200.59,  # Mercury
    'Tl': 204.38,  # Thallium
    'Pb': 207.21,  # Lead
    'Bi': 208.98,  # Bismuth
    'Po': 209,  # Polonium
    'At': 210,  # Astatine
    'Rn': 222,  # Radon
    'Fr': 223,  # Francium
    'Ra': 226,  # Radium
    'Ac': 227,  # Actinium
    'Th': 232.04,  # Thorium
    'Pa': 231.04,  # Protactinium
    'U': 238.03,  # Uranium
    'Np': 237,  # Neptunium
    'Pu': 244,  # Plutonium
    'Am': 243,  # Americium
    'Cm': 247,  # Curium
    'Bk': 247,  # Berkelium
    'Cf': 251,  # Californium
    'Es': 252,  # Einsteinium
    'Fm': 257,  # Fermium
    'Md': 258,  # Mendelevium
    'No': 259,  # Nobelium
    'Lr': 266,  # Lawrencium
    'Rf': 267,  # Rutherfordium
    'Db': 268,  # Dubnium
    'Sg': 269,  # Seaborgium
    'Bh': 270,  # Bohrium
    'Hs': 269,  # Hassium
    'Mt': 278,  # Meitnerium
    'Ds': 281,  # Darmstadtium
    'Rg': 282,  # Roentgenium
    'Cn': 285,  # Copernicium
    'Uut': 286,  # ununtrium (temporary)
    'Nh': 286,  # Nihonium
    'Uuq': 289,  # ununquadium (temporary)
    'Fl': 289,  # Flerovium
    'Uup': 289,  # ununpentium (temporary)
    'Mc': 289,  # Moscovium
    'Uuh': 293,  # ununhexium (temporary)
    'Lv': 293,  # Livermorium
    'Uus': 294,  # ununseptium (temporary)
    'Ts': 294,  # Tennessine
    'Uuo': 294,  # ununoctium (temporary)
    'Og': 294,  # Oganesson
}


def Ar(element: Any) -> Float:
    """Retrieve the relative atomic mass of the element.

    :param element: Any object that provides a __str__ or __repr__ method
                    that gives a string of the symbol of an element.
    :return: The relative atomic mass of the element (in amu).
    :raise LookupError: Raised when the element symbol can not be found in data.

    >>> Ar('H')
    1.01
    >>> Ar(sympy.Symbol('H'))
    1.01
    >>> class Foo:
    ...     def __repr__(self):
    ...         return 'H'
    >>> Ar(Foo())
    1.01
    >>> Ar('Ha')  # not an element
    Traceback (most recent call last):
        ...
    LookupError: unknown element symbol 'Ha'
    """
    symbol = str(element)
    if symbol in ATOMIC_MASSES:
        return Float(ATOMIC_MASSES[symbol], 3)
    raise LookupError(f"unknown element symbol '{symbol}'")


CONSTANTS = {
    constant_name: sympy.S(constant_value) for constant_name, constant_value in
    {
        "L": 6.02e23,  # Avogadro's constant / mol^{-1}
        "N_A": 6.02e23,  # Avogadro's constant / mol^{-1}
        "R": 8.31,  # Gas constant / J K^{-1} mol^{-1}
        "c": 3.00e8,  # Speed of light in vacuum / m s^{-1}
        "c_water": 4.18,  # Specific heat capacity of water / kJ kg^{-1} K^{-1} / J g^{-1} K^{-1}
        "h": 6.63e-32,  # Plank's constant / J s
        "F": 9.65e4,  # Faraday's / C mol^{-1}
        "K_w": 1.00e-14,  # Ionic product of water at 298K / mol^2 dm^{-6}
        "g": 9.81,  # Acceleration of free fall (Earth's surface) / m s^{-2}
        "G": 6.67e-11,  # Gravitational constant / N m^2 kg^{-2}
        "k_B": 1.38e-23,  # Boltzmann constant / J K^{-1}
        "sigma": 5.67e-8,  # Stefan-Boltzmann constant / W m^{-2} K^{-4}
        "k": 8.99e9,  # Coulomb constant / N m^2 C^{-2}
        "epsilon_0": 8.85e-12,  # Permittivity of free space / C^2 N^{-1} m^{-2}
        "mu_0": 4e-7 * pi,  # Permeability of free space / T m A^{-1}
        "e": 1.60e-19,  # Elementary charge / C
        "m_e": 9.110e-31,  # Electron rest mass / kg
        "m_p": 1.673e-27,  # Proton rest mass / kg
        "m_n": 1.675e-27,  # Neutron rest mass / kg
        "S": 1.36e3,  # Solar constant / W m^{-2}
        "R_0": 1.20e-15  # Fermi radius / m
    }.items()
}
CONSTANTS['Ar'] = Ar
