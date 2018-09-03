self.importScripts('/components/numbers/decimal.js');

self.addEventListener('message', function(e) {
  const data = e.data;
  let shouldRun = true;
  let numbers;

  if(parseInt(data.limit) < 1) {
    postMessage('null');
    return;
  }

  switch (data.cmd) {
    case 'stop':
      postMessage('Worker stopped.' + 
        data.msg );
      shouldRun = false;
      self.close(); // Terminates the worker.
      return;
      break;
    case 'prime':
      numbers = atkinsSieve(data.limit);
      break;
    case 'fib':
      numbers = fib(data.limit);
      break;
    case 'pi':
      numbers = chudnovsky(data.limit);
      if(typeof(numbers) === 'object') {
        numbers = '1.' + numbers.d.join('').substr(0,data.limit);
      }
      break;
    case 'euler':
      numbers = euler(data.limit);
      break;
    case 'phi':
      numbers = phi(data.limit);
      break;
    case 'sq2':
      numbers = sq2(data.limit);
      break;
    default:
      postMessage('What is ' + data.msg +'?');
      return;
  }
  postMessage(numbers);
}, false);

// fast prime generator
function atkinsSieve(limit){
  let results = [2,3,5];
  const sLen = limit+1;
	let sieve = new Array(sLen);
  let i = 0;

	for(; i < sLen; i++){
		sieve[i] = 0;
	}
	
	const factor = Math.floor(Math.sqrt(limit))+1;
  let n,j;
  i = 1;
	
	for(; i < factor; i++){
    j = 1;
		for(; j < factor; j++){
			n = 4 * (Math.pow(i,2)) + (Math.pow(j,2));
			
			if((n <= limit) && ((n % 12 === 1) || (n % 12 === 5))){
				sieve[n] = sieve[n] ^ 1;
			}
			
			n = 3 * (Math.pow(i,2)) + (Math.pow(j,2));
			
			if((n <= limit) && (n % 12 === 7)){
				sieve[n] = sieve[n] ^ 1;
			}
			
			if(i > j){
				n = 3 * (Math.pow(i,2)) - (Math.pow(j,2));
				
				if((n <= limit) && (n % 12 === 11)){
					sieve[n] = sieve[n] ^ 1;
				}
			}
		}	
	}
  
  i = 5;
	for(; i < factor; i++){
		if(sieve[i] === 1){
      j = (Math.pow(i,2));
			for(; j < limit; j += Math.pow(i,2)){
				sieve[j] = 0;
			}
		}
	}
	
  // If the number is prime, push to the results array
  i = 7;
  j = 3;
	for(; i< limit; i++){
		if(sieve[i] === 1){
      results[j] = i;
      j++;
		}
	}
	
	return results;
}

// fast fibonacci
function fib(limit) {
  let result = [0];
  if(limit === 2) {
    result = [0,1];
  } else if(limit >= 3) {
    result = [0,1,1];
  }
  let i = 3;

  for (; i < limit; i++) {
		result[i] = result[i-1]+ result[i-2];
  }
  
  return result;
}

// fast pi digits calculation (over 2000 not optimal)
function chudnovsky(digits){
  digits = parseInt(digits);
  Decimal.precision = digits + 2;

  function factorial(n) {
    let i = 2, r = new Decimal(1);
    for (; i <= n; r = r.times(i++));
    return r;
  }

  // The number of decimal digits the algorithm generates per iteration.
  const digits_per_iteration = 14.1816474627254776555;
  const iterations = ( digits / digits_per_iteration ) + 1;

  const a = new Decimal(13591409);
  const b = new Decimal(545140134);
  const c = new Decimal(-640320);

  let numerator, denominator;
  let sum = new Decimal(0);
  let k = 0;

  for (; k < iterations; k++) {

    // (6k)! * (13591409 + 545140134k)
    numerator = factorial( 6*k ).times( a.plus( b.times(k) ) );

    // (3k)! * (k!)^3 * -640320^(3k)
    denominator = factorial(3*k).times( factorial(k).pow(3) ).times( c.pow(3*k) );

    sum = sum.plus( numerator.div(denominator) );
  }

  // pi = ( sqrt(10005) * 426880 ) / sum
  return Decimal.sqrt(10005).times(426880).div(sum).toSD(digits);
}

// fastish euler digits calculation
function euler(digits) {
  Decimal.precision = digits + 2;

  let zero = new Decimal(0);
  let one = new Decimal(1);
  let rval, fval, invert;
  let i = 0;

  for (; i <= digits; i++) {
    fval = factorial(i);
    invert = one.dividedBy(fval)
    zero = zero.plus(invert)
  }
  rval = zero.toFixed(Number(digits));
  return rval;

  function factorial(n) {
    let i = 2, r = new Decimal(1);
    for (; i <= n; r = r.times(i++));
    return r;
  }
}

// phi (golden ratio) digits calculation, need a faster one more accurate
function phi(digits) {
  Decimal.precision = digits + 2;

  let phi = new Decimal(0);
  let numer;
  let rval;
  if(digits < 15) {
    numer = digits+1;
    numer = 1 + Math.sqrt(5).toPrecision(numer);
  } else {
    numer = Decimal.sqrt(5).plus(1).toFixed(Number(digits));
  }

  phi = numer / 2;
  rval = phi.toFixed(Number(digits))
  return rval;
}

// square root of 2, need a faster one
function sq2(digits) {
  Decimal.precision = digits + 2;

  let val, rval;
  if(digits < 15) {
    val = digits + 1;
    rval = Math.sqrt(2).toPrecision(val);
  } else {
    val = Decimal.sqrt(2);
    rval = val.toFixed(Number(digits));
  }
  
  return rval;
}
