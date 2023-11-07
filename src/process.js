const fs = require("node:fs/promises");
const { contextBridge, ipcRenderer } = require('electron');
const jsonData = require('./handleData');

function extractWordsFromString(inputString) {
    // Use a regular expression to match and remove unwanted characters
    const cleanedString = inputString.replace(/[.-_|]/g, ' ');

    // Split the cleaned string into an array of words
    const words = cleanedString.split(/\s+/).filter(word => word !== '');

    // Join the words into a single string with spaces
    const cleanedStringResult = words.join(' ');

    return cleanedStringResult;
}

async function initDirContent() {
    let tv = [];
    let movies = [];
    let showIndexes = new Object();

    const readDirs = await jsonData.readFile('dirs');
    console.log(readDirs)

    if (readDirs.dirs.length > 0) {
        const folderPath = readDirs.dirs[0];
        const files = await fs.readdir(folderPath);

        files.forEach((file) => {
            const ext_spit = file.split(".");
            const ext = ext_spit[ext_spit.length - 1];

            if (file.includes("S0") || file.includes('E0')) {
                if (ext === "mkv" || ext === "mp4") {
                    tv.push(file);
                }
            } else {
                if (ext === "mkv" || ext === "mp4") {
                    movies.push(file);
                }
            }
        });

        tv.forEach((show) => {
            const title = extractWordsFromString(show.split("S0")[0]);
            if (showIndexes.hasOwnProperty(title)) {
                showIndexes[title] = showIndexes[title] + 1;
            } else {
                showIndexes[title] = 1;
            }
        });
    }

    return {
        tv: tv,
        movies: movies
    }
}

function openFile(event) {
    // Calling to main process
    ipcRenderer.invoke('from_web_openfile', event.target.id).then((result) => {
        console.log(result)
    });
}

function addListnersToBtns() {
    // Open btn list
    const btnList = document.querySelectorAll(".openfile");

    if (btnList.length > 1) {
        // Attach open file func to btns
        btnList.forEach((btn) => {
            btn.addEventListener('click', openFile);
        });
    } else {
        window.setTimeout(() => {
            addListnersToBtns();
        }, 5);
    }
}

async function initDataToDom(){
    console.log('initDom')
    const inpTv = document.getElementById("tv");
    const inpMovies = document.getElementById("movies");
    // Get content
    const dirContent = await initDirContent();
    // Stringify content
    const movies = JSON.stringify(dirContent.movies).replace(/(&quot\;)/g, "\"");
    const tv = JSON.stringify(dirContent.tv).replace(/(&quot\;)/g, "\"");
    // Add values to DOM
    inpTv.value = tv;
    inpMovies.value = movies;
}

window.addEventListener('DOMContentLoaded', async () => {
    initDataToDom();

    document.getElementById("folder-select").addEventListener('click', (event) => {
        ipcRenderer.invoke('from_web_selectfolder').then(async (result) => {
            await result;
            initDataToDom()
        })
    })

    const config = { attributes: true, childList: true, subtree: true };

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                addListnersToBtns()
            } else if (mutation.type === "attributes") {
                console.log(`The ${mutation.attributeName} attribute was modified.`);
            }
        }
    };

    const observer = new MutationObserver(callback);

    observer.observe(document, config);
})

