"use strict"

/*
* Написать CLI, по аналогии с разобранным примером,
* и добавьте следующие функции:
* 1. Возможность передавать путь к директории в программу.
* Это актуально, когда вы не хотите покидать текущую директорию,
* но надо просмотреть файл, находящийся в другом месте.
* 2. В директории переходить во вложенные каталоги.
* 3. Во время чтения файлов искать в них заданную строку или паттерн.
*/
console.log('Hello World!');

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Получение текущего пути (__dirname)
const __filename = fileURLToPath(import.meta.url);
let currentDir = path.dirname(__filename);

// Параметры командной строки с использованием yargs
const options = yargs(hideBin(process.argv))
    .usage('Usage: node $0 -p <directory path>')
    .option('p', {
        alias: 'path',
        describe: 'Path to start browsing files',
        type: 'string',
        default: process.cwd(),  // Начинаем с текущей директории по умолчанию
        demandOption: false
    })
    .help()
    .argv;

currentDir = path.resolve(options.path);  // Устанавливаем начальную директорию

// Вариант 1:

// // Функция для проверки файлов и директорий
// const isFile = (fileName) => fs.lstatSync(fileName).isFile();
// const isDirectory = (dirName) => fs.lstatSync(dirName).isDirectory();

// // Функция для чтения содержимого директории
// const listDirectory = (dirPath) => {
//     return fs.readdirSync(dirPath).map(name => {
//         const fullPath = path.join(dirPath, name);
//         return {
//             name,
//             isFile: isFile(fullPath),
//             isDirectory: isDirectory(fullPath)
//         };
//     });
// };

// // Вопросы с помощью inquirer
// const askQuestions = async () => {
//     while (true) {
//         console.log(`\nТекущая директория: ${currentDir}`);
//         const choices = listDirectory(currentDir).map(item => ({
//             name: item.name + (item.isDirectory ? ' (каталог)' : ''),
//             value: item.name,
//             short: item.name,
//             isFile: item.isFile,
//             isDirectory: item.isDirectory
//         }));

//         choices.unshift({ name: '.. (на уровень выше)', value: '..', short: '..' });

//         const { chosenItem } = await inquirer.prompt([{
//             name: 'chosenItem',
//             type: 'list',
//             message: 'Выберите файл или директорию:',
//             choices
//         }]);

//         if (chosenItem === '..') {
//             currentDir = path.dirname(currentDir);
//         } else {
//             const selectedPath = path.join(currentDir, chosenItem);
//             if (isDirectory(selectedPath)) {
//                 currentDir = selectedPath;
//             } else {
//                 await handleFile(selectedPath);
//                 break;
//             }
//         }
//     }
// };

// // Обработка содержимого файла
// const handleFile = async (filePath) => {
//     const { searchPattern } = await inquirer.prompt([{
//         name: 'searchPattern',
//         type: 'input',
//         message: 'Введите строку или регулярное выражение для поиска в файле:'
//     }]);

//     const fileContent = fs.readFileSync(filePath, 'utf8');
//     const regex = new RegExp(searchPattern, 'g');
//     const matches = [...fileContent.matchAll(regex)];

//     if (matches.length > 0) {
//         console.log(`\nНайдены совпадения в файле ${filePath}:`);
//         matches.forEach((match, index) => {
//             console.log(`${index + 1}. ${match[0]}`);
//         });
//     } else {
//         console.log('Совпадений не найдено.');
//     }
// };

// askQuestions().catch(err => console.error('Ошибка:', err.message));

// Вариант 2:

// Получение информации о файле/директории
const getFileInfo = (filePath) => {
  const stats = fs.lstatSync(filePath);
  return {
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
  };
};

// Функция для получения содержимого директории
const listDirectory = (dirPath) => {
  const entries = fs.readdirSync(dirPath);
  return entries.map((name) => {
    const fullPath = path.join(dirPath, name);
    const { isFile, isDirectory } = getFileInfo(fullPath);
    return { name, isFile, isDirectory, fullPath };
  });
};

// Вопросы с помощью inquirer
const askQuestions = async () => {
  while (true) {
    console.log(`\nТекущая директория: ${currentDir}`);
    const items = listDirectory(currentDir);

    if (items.length === 0) {
      console.log('Директория пуста.');
      return;
    }

    const choices = items.map((item) => ({
      name: item.name + (item.isDirectory ? ' (каталог)' : ''),
      value: item.fullPath,
      isFile: item.isFile,
      isDirectory: item.isDirectory,
    }));

    choices.unshift({ name: '.. (на уровень выше)', value: path.dirname(currentDir) });

    const { chosenPath } = await inquirer.prompt([
      {
        name: 'chosenPath',
        type: 'list',
        message: 'Выберите файл или директорию:',
        choices,
      },
    ]);

    const selectedItem = items.find((item) => item.fullPath === chosenPath) || { isDirectory: true };

    if (selectedItem.isDirectory) {
      currentDir = chosenPath;
    } else {
      await handleFile(chosenPath);
      break;
    }
  }
};

// Обработка содержимого файла
const handleFile = async (filePath) => {
  const { searchPattern } = await inquirer.prompt([
    {
      name: 'searchPattern',
      type: 'input',
      message: 'Введите строку или регулярное выражение для поиска в файле:',
    },
  ]);

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(searchPattern, 'g');
  const matches = [...fileContent.matchAll(regex)];

  if (matches.length > 0) {
    console.log(`\nНайдены совпадения в файле ${filePath}:`);
    let matchCount = 0;

    fileContent.split('\n').forEach((line, lineNumber) => {
      if (regex.test(line) && matchCount < 10) {
        console.log(`${matchCount + 1}. Строка ${lineNumber + 1}: ${line.trim()}`);
        matchCount++;
      }
    });

    if (matches.length > 10) {
      await askForMoreResults(matches, fileContent);
    }
  } else {
    console.log('Совпадений не найдено.');
  }
};

// Запрос у пользователя на показ оставшихся совпадений
const askForMoreResults = async (matches, fileContent) => {
  const { showMore } = await inquirer.prompt([
    {
      name: 'showMore',
      type: 'confirm',
      message: `Показаны первые 10 совпадений из ${matches.length}. Показать оставшиеся?`,
    },
  ]);

  if (showMore) {
    // Показать оставшиеся совпадения
    let matchCount = 10;
    fileContent.split('\n').forEach((line, lineNumber) => {
      if (new RegExp(matches[0][0]).test(line) && matchCount < matches.length) {
        console.log(`${matchCount + 1}. Строка ${lineNumber + 1}: ${line.trim()}`);
        matchCount++;
      }
    });
  } else {
    console.log('Завершение работы программы.');
  }
};

askQuestions().catch((err) => console.error('Ошибка:', err.message));