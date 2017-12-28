/**
 * Round a number to the specified precision,
 * converting to scientific notation in the process if its length as a string exceeds the precision.
 * @param number the number to be rounded
 * @param precision the number of digits desired; defaults to 3
 */
export default function round(number, precision) {
    return Number(number).toPrecision(precision || 3)
}
