"use strict"

/**
* Задача:
* Напишите программу для вывода в консоль простых чисел, чтобы они попадали в указанный диапазон включительно.
* При этом числа должны окрашиваться в цвета по принципу светофора:

* первое число выводится зелёным цветом;
* второе — жёлтым;
* третье — красным.
* и так далее.

* Диапазон, куда попадут числа, указывается при запуске программы (например node index.js 0 100).
* Если простых чисел в диапазоне нет, нужно, чтобы программа сообщила об этом в терминале красным цветом.
* Если аргумент, переданный при запуске, не считается числом — сообщите об этом ошибкой и завершите программу.
*/

import colors from 'colors'
console.log(colors.random('Hello World!'))

// 1-й вариант
// const [arg1, arg2] = process.argv.slice(2);

// // Проверка корректности входных аргументов
// if (isNaN(arg1) || isNaN(arg2)) {
//   console.error(colors.red('Ошибка: оба аргумента должны быть числами.'));
//   process.exit(1);
// }

// const start = parseInt(arg1, 10);
// const end = parseInt(arg2, 10);

// // Функция для проверки, является ли число простым
// function isPrime(num) {
//   if (num < 2) return false;
//   for (let i = 2; i <= Math.sqrt(num); i++) {
//     if (num % i === 0) return false;
//   }
//   return true;
// }

// const primes = [];
// for (let i = start; i <= end; i++) {
//   if (isPrime(i)) {
//     primes.push(i);
//   }
// }

// // Вывод результата
// if (primes.length === 0) {
//   console.log(colors.red('Простых чисел в указанном диапазоне нет.'));
// } else {
//   primes.forEach((prime, index) => {
//     const color = index % 3 === 0
//       ? colors.green
//       : index % 3 === 1
//       ? colors.yellow
//       : colors.red;
//     console.log(color(prime));
//   });
// }

// 2-й вариант
// Функция для проверки корректности аргументов
function parseArguments(args) {
  const [arg1, arg2] = args.slice(2);
  if (isNaN(arg1) || isNaN(arg2)) {
    console.error(colors.red('Ошибка: оба аргумента должны быть числами.'));
    process.exit(1);
  }
  return [parseInt(arg1, 10), parseInt(arg2, 10)];
}

// Функция для проверки, является ли число простым
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// Функция для генерации простых чисел в диапазоне
function findPrimesInRange(start, end) {
  const primes = [];
  for (let i = start; i <= end; i++) {
    if (isPrime(i)) primes.push(i);
  }
  return primes;
}

// Функция для вывода чисел с цветовой раскраской
function printPrimes(primes) {
  if (primes.length === 0) {
    console.log(colors.red('Простых чисел в указанном диапазоне нет.'));
    return;
  }
  primes.forEach((prime, index) => {
    const color =
      index % 3 === 0 ? colors.green : index % 3 === 1 ? colors.yellow : colors.red;
    console.log(color(prime));
  });
}

// Основной блок программы
function main() {
  const [start, end] = parseArguments(process.argv);
  const primes = findPrimesInRange(start, end);
  printPrimes(primes);
}

main();
