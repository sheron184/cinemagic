const fs = require("node:fs/promises");
const os = require('os');

const storage = require('electron-json-storage');
storage.setDataPath(os.tmpdir());

async function validateJsonFile(file) {
    return new Promise((resolve) => {
        fs.access(`json/${file}`)
            .then(() => {
                console.log('The file exists.');
                resolve(true)
            })
            .catch((err) => {
                console.log(err.code)
                if (err.code === 'ENOENT') {
                    const data = {
                        dirs: []
                    }
                    fs.writeFile(`../json/${file}`, JSON.stringify(data), 'utf8', (err) => {
                        if (err) {
                            console.error(err);
                            resolve(false)
                        }
                        resolve(true)
                    });
                }
            });
    })

}

const jsonData = {
    readFile: async (file) => {
        return new Promise((resolve) => {
            storage.get(file, function (error, data) {
                if (error) throw error;
                console.log(data)
                console.log(storage.getDataPath())
                if (!data.dirs) {
                    storage.set(file, { dirs: [] }, function (error) {
                        if (error) throw error;
                    });
                    resolve({dirs:[]})
                }

                resolve(data)
            });
        });

    },
    writeFile: async (data, file) => {
        storage.set(file, data, function (error) {
            if (error) throw error;
        });
    }
};

module.exports = jsonData;