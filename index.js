"use strict";

const debug  = require('debug')('koa-api-base');
const Koa = require('koa');
const morgan = require('koa-morgan');
const convert = require('koa-convert');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const resources = require('koa-66-aggregate');
const servicesStack = require('services-stack');
const extend = require('extend');

class Acacia extends Koa {

    constructor(config) {
        super();

        // expose config
        this.context.config = config;

        // logger
        if ( this.env !== 'test')
            this.use(convert(morgan.middleware(this.context.config.log || 'dev')));

        // cors
        if (this.context.config.security && this.context.config.security.cors)
            this.initCors(this.context.config.security.cors);

        // body parser
        this.use(convert(bodyParser()));
    }

    initCors (config) {
        this.use(convert(cors({
            origin: req => {
                const has = config.domains.filter( domain =>
                    req.header.origin === domain.origin
                );
                return (has.length)? has[0].origin : false;
            }
        })));
    }

    initServices (context) {
        context = extend({config: this.context.config}, context);
        this.context.services = servicesStack(this.context.config.path.services, context);
        return this;
    }

    initResources () {
        this.use(resources(this.context.config.path.resources).routes());
        return this;
    }

    listen(fn) {
        return super.listen(this.context.config.port, () => {
            if ( this.env === 'development')
                console.log('listening' ,this.context.config.port);
            if (fn && typeof fn == 'function') fn.call();
        });
    }

}
module.exports = Acacia;
