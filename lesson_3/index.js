"use strict"
/*
* Задача:
* Есть файл с логами запросов к серверу весом более 2 Гб.
* Напишите программу, которая находит в этом файле все записи с ip-адресами 89.123.1.41 и 34.48.240.111,
* а также сохраняет их в отдельные файлы с названием %ip-адрес%_requests.log.
*/

console.log('Hello World!');

import fs from 'fs';
// import readline from 'readline';

const ACCESS_LOG = './access_tmp.log'; // Путь к вашему файлу
const ipAddresses = ['89.123.1.41', '34.48.240.111']; // IP-адреса для фильтрации
const outputFiles = {
  '89.123.1.41': '89.123.1.41_requests.log',
  '34.48.240.111': '34.48.240.111_requests.log',
};

// Вариант 1:
// Создаем потоки записи для каждого IP-адреса
// const writeStreams = {};
// ipAddresses.forEach((ip) => {
//   writeStreams[ip] = fs.createWriteStream(outputFiles[ip], { flags: 'a' });
// });

// // Функция для обработки файла
// async function processLogFile() {
//   try {
//     const fileStream = fs.createReadStream(ACCESS_LOG);

//     const rl = readline.createInterface({
//       input: fileStream,
//       crlfDelay: Infinity,
//     });

//     rl.on('line', (line) => {
//       ipAddresses.forEach((ip) => {
//         if (line.includes(ip)) {
//           writeStreams[ip].write(line + '\n');
//         }
//       });
//     });

//     rl.on('close', () => {
//       console.log('Обработка завершена.');
//       // Закрываем потоки записи
//       Object.values(writeStreams).forEach((stream) => stream.end());
//     });
//   } catch (err) {
//     console.error('Ошибка при обработке файла:', err);
//   }
// }

// processLogFile();

// Вариант 2:

/**
 * Создает потоки записи для каждого IP-адреса.
 */
// function createWriteStreams() {
//   const streams = {};
//   ipAddresses.forEach((ip) => {
//     streams[ip] = fs.createWriteStream(outputFiles[ip], { flags: 'a' });
//   });
//   return streams;
// }

// /**
//  * Закрывает все потоки записи.
//  * @param {Object} streams - Объект с потоками записи.
//  */
// function closeWriteStreams(streams) {
//   Object.values(streams).forEach((stream) => stream.end());
// }

// /**
//  * Проверяет, существует ли файл.
//  * @param {string} filePath - Путь к файлу.
//  */
// async function checkFileExists(filePath) {
//   try {
//     await fs.promises.access(filePath, fs.constants.F_OK);
//   } catch {
//     console.error(`Ошибка: Файл ${filePath} не найден.`);
//     process.exit(1);
//   }
// }

// /**
//  * Обрабатывает лог-файл, фильтруя строки по IP-адресам.
//  */
// async function processLogFile() {
//   await checkFileExists(ACCESS_LOG);

//   const writeStreams = createWriteStreams();

//   try {
//     const fileStream = fs.createReadStream(ACCESS_LOG);

//     const rl = readline.createInterface({
//       input: fileStream,
//       crlfDelay: Infinity,
//     });

//     rl.on('line', (line) => {
//       ipAddresses.forEach((ip) => {
//         if (line.includes(ip)) {
//           writeStreams[ip].write(line + '\n');
//         }
//       });
//     });

//     rl.on('close', () => {
//       console.log('Обработка завершена.');
//       closeWriteStreams(writeStreams);
//     });
//   } catch (err) {
//     console.error('Ошибка при обработке файла:', err);
//     closeWriteStreams(writeStreams);
//   }
// }

// // Запуск программы
// processLogFile();

// Вариант 3 (без readline):
/**
 * Создает потоки записи для каждого IP-адреса.
 */
function createWriteStreams() {
  const streams = {};
  ipAddresses.forEach((ip) => {
    streams[ip] = fs.createWriteStream(outputFiles[ip], { flags: 'a' });
  });
  return streams;
}

/**
 * Закрывает все потоки записи.
 * @param {Object} streams - Объект с потоками записи.
 */
function closeWriteStreams(streams) {
  Object.values(streams).forEach((stream) => stream.end());
}

/**
 * Проверяет, существует ли файл.
 * @param {string} filePath - Путь к файлу.
 */
async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
  } catch {
    console.error(`Ошибка: Файл ${filePath} не найден.`);
    process.exit(1);
  }
}

/**
 * Обрабатывает лог-файл построчно без readline.
 */
async function processLogFile() {
  await checkFileExists(ACCESS_LOG);

  const writeStreams = createWriteStreams();

  try {
    const fileStream = fs.createReadStream(ACCESS_LOG, { encoding: 'utf8' });
    let leftover = ''; // Буфер для оставшейся части строки

    fileStream.on('data', (chunk) => {
      // Разбиваем чанки на строки
      const lines = (leftover + chunk).split('\n');
      leftover = lines.pop(); // Сохраняем последнюю неполную строку

      // Обрабатываем каждую строку
      lines.forEach((line) => {
        ipAddresses.forEach((ip) => {
          if (line.includes(ip)) {
            writeStreams[ip].write(line + '\n');
          }
        });
      });
    });

    fileStream.on('end', () => {
      // Обрабатываем оставшуюся строку
      if (leftover) {
        ipAddresses.forEach((ip) => {
          if (leftover.includes(ip)) {
            writeStreams[ip].write(leftover + '\n');
          }
        });
      }

      console.log('Обработка завершена.');
      closeWriteStreams(writeStreams);
    });

    fileStream.on('error', (err) => {
      console.error('Ошибка при чтении файла:', err);
      closeWriteStreams(writeStreams);
    });
  } catch (err) {
    console.error('Ошибка при обработке файла:', err);
    closeWriteStreams(writeStreams);
  }
}

// Запуск программы
processLogFile();
