/* eslint-disable no-undef */
self.importScripts('/components/numbers/decimal.js');

// square root of 2, need a faster one
const sq2 = (digits) => {
  Decimal.precision = digits + 2;

  let rval, val;
  if (digits < 15) {
    val = digits + 1;
    rval = Math.sqrt(2).toPrecision(val);
  } else {
    val = Decimal.sqrt(2);
    rval = val.toFixed(Number(digits));
  }

  return rval;
};

// phi (golden ratio) digits calculation, need a faster one more accurate
const phi = (digits) => {
  Decimal.precision = digits + 2;

  let phi = new Decimal(0);
  let numer;
  if (digits < 15) {
    numer = digits + 1;
    numer = 1 + Math.sqrt(5).toPrecision(numer);
  } else {
    numer = Decimal.sqrt(5).plus(1).toFixed(Number(digits));
  }

  phi = numer / 2;
  return phi.toFixed(Number(digits));
};

const factorial = (n) => {
  let i = 2, r = new Decimal(1);
  for (; i <= n; r = r.times(i++));
  return r;
};

// fastish euler digits calculation
const euler = (digits) => {
  Decimal.precision = digits + 2;

  let zero = new Decimal(0);
  const one = new Decimal(1);
  let fval, invert;
  let i = 0;

  for (; i <= digits; i++) {
    fval = factorial(i);
    invert = one.dividedBy(fval);
    zero = zero.plus(invert);
  }
  return zero.toFixed(Number(digits));
};

// fast pi digits calculation (over 2000 not optimal)
const chudnovsky = (digits) => {
  digits = parseInt(digits, 10);
  Decimal.precision = digits + 2;

  // The number of decimal digits the algorithm generates per iteration.
  // eslint-disable-next-line no-loss-of-precision
  const digitsPerIteration = 14.1816474627254776555;
  const iterations = digits / digitsPerIteration + 1;
  const a = new Decimal(13591409);
  const b = new Decimal(545140134);
  const c = new Decimal(-640320);
  let denominator, numerator;
  let sum = new Decimal(0);
  let k = 0;

  for (; k < iterations; k++) {
    // (6k)! * (13591409 + 545140134k)
    numerator = factorial(6 * k).times(a.plus(b.times(k)));

    // (3k)! * (k!)^3 * -640320^(3k)
    denominator = factorial(3 * k).times(factorial(k).pow(3)).times(c.pow(3 * k));

    sum = sum.plus(numerator.div(denominator));
  }

  // pi = ( sqrt(10005) * 426880 ) / sum
  return Decimal.sqrt(10005).times(426880).div(sum).toSD(digits);
};

// fast fibonacci, (matrix faster for 1000s)
const fib = (n) => {
  if (n <= 1) return [0];
  if (n === 2) return [0, 1];

  const result = [0, 1];
  let twoBefore = 0,
    oneBefore = 1,
    current;

  for (let i = 2; i < n; i++) {
    current = oneBefore + twoBefore;
    result.push(current);
    twoBefore = oneBefore;
    oneBefore = current;
  }

  return result;
};

// fast prime generator
const atkinsSieve = (limit) => {
  const results = [2, 3, 5];
  const sLen = limit + 1;
  const sieve = new Array(sLen);
  let i = 0;

  for (; i < sLen; i++) {
    sieve[i] = 0;
  }

  const factor = Math.floor(Math.sqrt(limit)) + 1;
  let j, n;
  i = 1;

  for (; i < factor; i++) {
    j = 1;
    for (; j < factor; j++) {
      n = 4 * Math.pow(i, 2) + Math.pow(j, 2);

      if (n <= limit && (n % 12 === 1 || n % 12 === 5)) {
        sieve[n] ^= 1;
      }

      n = 3 * Math.pow(i, 2) + Math.pow(j, 2);

      if (n <= limit && n % 12 === 7) {
        sieve[n] ^= 1;
      }

      if (i > j) {
        n = 3 * Math.pow(i, 2) - Math.pow(j, 2);

        if (n <= limit && n % 12 === 11) {
          sieve[n] ^= 1;
        }
      }
    }
  }

  i = 5;
  for (; i < factor; i++) {
    if (sieve[i] === 1) {
      j = Math.pow(i, 2);
      for (; j < limit; j += Math.pow(i, 2)) {
        sieve[j] = 0;
      }
    }
  }

  // If the number is prime, push to the results array
  i = 7;
  j = 3;
  for (; i < limit; i++) {
    if (sieve[i] === 1) {
      results[j] = i;
      j++;
    }
  }

  return results;
};

self.addEventListener('message', (e) => {
  const data = e.data;
  const limit = parseInt(data.limit, 10);
  let numbers;

  if (isNaN(limit) && limit < 1) {
    postMessage('null');
    return;
  }

  switch (data.cmd) {
    case 'stop':
      postMessage(`Worker stopped.${data.msg}`);
      self.close(); // Terminates the worker.
      return;
    case 'prime':
      numbers = atkinsSieve(limit);
      break;
    case 'fib':
      numbers = fib(limit);
      break;
    case 'pi':
      numbers = chudnovsky(limit);
      if (typeof numbers === 'object') {
        numbers = `1.${numbers.d.join('').substring(0, limit)}`;
      }
      break;
    case 'euler':
      numbers = euler(limit);
      break;
    case 'phi':
      numbers = phi(limit);
      break;
    case 'sq2':
      numbers = sq2(limit);
      break;
    default:
      postMessage(`What is ${data.msg}?`);
      return;
  }
  postMessage(numbers);
}, false);
