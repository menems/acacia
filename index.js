"use strict";

const debug  = require('debug')('acacia');
const Koa = require('koa');
const morgan = require('koa-morgan');
const convert = require('koa-convert');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const resources = require('koa-66-aggregate');
const servicesStack = require('services-stack');
const extend = require('extend');
const Validation = require('chain-validator');

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

        // validation helper
        this.use(Validation.koaMiddleware);
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

    /**
     * Initialise services throw directories using
     * services-stack package.
     *
     * Inject `context` object in services of type functions
     * Base context has already default properties:
     * - config: config object (constructor param)
     * - Validation: chain-validator objet(validation-helper)
     *
     * @param  {object} context
     * @return {object} Acacia instance
     */
    initServices (context) {
        const base = {
            config: this.context.config,
            Validation : Validation
        };
        context = extend(base, context);
        this.context.services = servicesStack(this.context.config.path.services, context);
        return this;
    }

    /**
     * Initialise routers throw directories
     *
     * Inject `plugins` object on each Router object
     *
     * @param  {object} context
     * @return {object} Acacia instance
     */
    initResources (plugins) {
        this.use(resources(this.context.config.path.resources, plugins).routes());
        return this;
    }

    listen(fn) {
        return super.listen(this.context.config.port, () => {
            if ( this.env === 'development')
                console.log('listening on ' + this.context.config.port);
            if (fn && typeof fn == 'function') fn.call(this);
        });
    }

}
module.exports = Acacia;
