'use strict';

const fs = require('fs');
const path = require('path');

module.exports = ressourcesPath => {

    const modules = [];

    fs.readdirSync(ressourcesPath).forEach(m => {
        modules.push({
            name : m,
            path : path.join(ressourcesPath, m)
        });
    });

    return modules;
}
