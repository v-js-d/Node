"use strict"

/**
* Задача:
* Напишите программу, которая будет принимать на вход несколько аргументов: дату и время в формате «час-день-месяц-год».
* Задача программы — создавать для каждого аргумента таймер с обратным отсчётом: посекундный вывод в терминал состояния таймеров (сколько осталось).
* По истечении какого-либо таймера, вместо сообщения о том, сколько осталось, требуется показать сообщение о завершении его работы.
* Важно, чтобы работа программы основывалась на событиях.
 */

console.log('Hello World!')

// Вариант 1:
import { EventEmitter } from 'events';

// Функция для проверки и парсинга даты
// function parseArguments(args) {
//   const timers = [];
//   args.forEach((arg) => {
//     const [day, month, year] = arg.split('-').map(Number);
//     const targetDate = new Date(year, month - 1, day);
//     if (
//       isNaN(targetDate.getTime()) ||
//       targetDate.getDate() !== day ||
//       targetDate.getMonth() !== month - 1 ||
//       targetDate.getFullYear() !== year
//     ) {
//       console.error(`Ошибка: Неверный формат даты "${arg}". Используйте формат "день-месяц-год".`);
//       process.exit(1);
//     }
//     if (targetDate < new Date()) {
//       console.error(`Ошибка: Указанная дата "${arg}" уже прошла.`);
//       process.exit(1);
//     }
//     timers.push(targetDate);
//   });
//   return timers;
// }

// // Функция для расчёта оставшегося времени
// function getTimeRemaining(targetDate) {
//   const now = new Date();
//   const diffMs = targetDate - now;
//   const seconds = Math.floor((diffMs / 1000) % 60);
//   const minutes = Math.floor((diffMs / 1000 / 60) % 60);
//   const hours = Math.floor((diffMs / 1000 / 60 / 60) % 24);
//   const days = Math.floor(diffMs / 1000 / 60 / 60 / 24);
//   return { total: diffMs, days, hours, minutes, seconds };
// }

// // Таймерная логика с использованием событий
// class CountdownTimer extends EventEmitter {
//   constructor(targetDate, id) {
//     super();
//     this.targetDate = targetDate;
//     this.id = id;
//     this.interval = null;
//   }

//   start() {
//     this.interval = setInterval(() => {
//       const remaining = getTimeRemaining(this.targetDate);
//       if (remaining.total <= 0) {
//         clearInterval(this.interval);
//         this.emit('end', this.id);
//       } else {
//         this.emit('tick', this.id, remaining);
//       }
//     }, 1000);
//   }
// }

// // Основная программа
// function main() {
//   const args = process.argv.slice(2);
//   if (args.length === 0) {
//     console.error('Ошибка: Укажите хотя бы одну дату в формате "день-месяц-год".');
//     process.exit(1);
//   }

//   const timers = parseArguments(args);

//   timers.forEach((timer, index) => {
//     const countdown = new CountdownTimer(timer, index + 1);

//     // Обработка событий таймера
//     countdown.on('tick', (id, remaining) => {
//       console.log(
//         `Таймер ${id}: осталось ${remaining.days}д ${remaining.hours}ч ${remaining.minutes}м ${remaining.seconds}с`
//       );
//     });

//     countdown.on('end', (id) => {
//       console.log(`Таймер ${id}: завершён!`);
//     });

//     countdown.start();
//   });
// }

// main();

// Вариант 2:
// Функция для проверки и парсинга даты
function parseArguments(args) {
  const timers = [];
  args.forEach((arg) => {
    // Проверяем формат: строго "день-месяц-год"
    if (!/^\d{2}-\d{2}-\d{4}$/.test(arg)) {
      console.error(`Ошибка: Неверный формат даты "${arg}". Используйте формат "день-месяц-год".`);
      process.exit(1);
    }

    // Парсим аргумент
    const [day, month, year] = arg.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day, 0, 0, 0);

    // Проверяем валидность даты
    if (
      isNaN(targetDate.getTime()) ||
      targetDate.getDate() !== day ||
      targetDate.getMonth() !== month - 1 ||
      targetDate.getFullYear() !== year
    ) {
      console.error(`Ошибка: Неверный формат даты "${arg}". Используйте формат "день-месяц-год".`);
      process.exit(1);
    }

    // Проверяем, что дата не прошла
    if (targetDate < new Date()) {
      console.error(`Ошибка: Указанная дата "${arg}" уже прошла.`);
      process.exit(1);
    }

    timers.push(targetDate);
  });

  return timers;
}

// Функция для расчёта оставшегося времени
function getTimeRemaining(targetDate) {
  const now = new Date();
  const diffMs = targetDate - now;
  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / 1000 / 60) % 60);
  const hours = Math.floor((diffMs / 1000 / 60 / 60) % 24);
  const days = Math.floor(diffMs / 1000 / 60 / 60 / 24);
  return { total: diffMs, days, hours, minutes, seconds };
}

// Форматированный вывод оставшегося времени
function formatRemainingTime({ days, hours, minutes, seconds }) {
  const parts = [];
  if (days > 0) parts.push(`${days}д`);
  if (hours > 0 || days > 0) parts.push(`${hours}ч`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}м`);
  parts.push(`${seconds}с`);
  return parts.join(' ');
}

// Таймерная логика с использованием событий
class CountdownTimer extends EventEmitter {
  constructor(targetDate, id) {
    super();
    this.targetDate = targetDate;
    this.id = id;
    this.interval = null;
  }

  start() {
    this.interval = setInterval(() => {
      const remaining = getTimeRemaining(this.targetDate);
      if (remaining.total <= 0) {
        clearInterval(this.interval);
        this.emit('end', this.id);
      } else {
        this.emit('tick', this.id, remaining);
      }
    }, 1000);
  }
}

// Основная программа
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Ошибка: Укажите хотя бы одну дату в формате "день-месяц-год".');
    process.exit(1);
  }

  const timers = parseArguments(args);

  timers.forEach((timer, index) => {
    const countdown = new CountdownTimer(timer, index + 1);

    // Обработка событий таймера
    countdown.on('tick', (id, remaining) => {
      console.log(`Таймер ${id}: осталось ${formatRemainingTime(remaining)}`);
    });

    countdown.on('end', (id) => {
      console.log(`Таймер ${id}: завершён!`);
    });

    countdown.start();
  });
}

main();