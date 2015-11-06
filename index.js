"use strict";

const Koa = require('koa');
const morgan = require('koa-morgan');
const convert = require('koa-convert');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-66');
const modelsStack = require('models-stack');

class App extends Koa{

    constructor(config) {
        super();
        this.context.config = config;

        if ( this.env !== 'test')
            this.use(convert(morgan.middleware(this.context.config.log || 'dev')));

        if (this.context.config.security.cors) {
            this.use(convert(cors({
                origin: req => {
                    const has = this.context.config.security.cors.domains.filter( domain =>
                        req.header.origin === domain.origin
                    );
                    return (has.length)? has[0].origin : false;
                }
            })));
        }

        this.use(convert(bodyParser()));
    }

    initModels (db) {
        this.context.models = modelsStack(this.context.config.path.models, {
            config : this.context.config,
            db : db
        });
        return this;
    }

    initResources () {
        const resources = require('./lib/ressources')(this.context.config.path.resources);
        var router = new Router();
        resources.forEach(r => {
            router.mount('/' + r.name, require(r.path));
        });
        this.use(router.routes());
        return this;
    }

    listen() {
        return super.listen(this.context.config.port, () => {
            if ( this.env !== 'test')
                console.log('listening' ,this.context.config.port);
        });
    }
}
module.exports = App;
