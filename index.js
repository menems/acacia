"use strict";

const path =  require('path');
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
            this.use(morgan(this.context.config.log || 'dev'));

        // cors
        if (this.context.config.security && this.context.config.security.cors)
            this.initCors(this.context.config.security.cors);

        // body parser
        this.use(bodyParser());

        // validation helper
        this.use(Validation.koaMiddleware);
    }

    initCors (config) {

        let options = {
            origin: req => {
                if (!req.header.origin ||
                    !config.domains ||
                    !config.domains.length ||
                    config.domains[0].origin === '*')
                    return '*';

                const has = config.domains.filter( domain =>
                    req.header.origin === domain.origin
                );
                return (has.length)? has[0].origin : false;
            }
        }

        if (config.headers) options.headers = config.headers;

        if (config.credentials) options.credentials = config.credentials;

        if (config.maxAge) options.maxAge = config.maxAge;

        this.use(convert(cors(options)));
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
     * @param  {object} options
     * @return {object} Acacia instance
     */
    services (options) {

        options = options || {};

        const base = {
            config: this.context.config,
            Validation : Validation
        };

        options.context = extend(base, options.context);
        this.context.services = servicesStack(options);
        return this;
    }

    /**
     * Initialise routers throw directories
     *
     * Inject `plugins` object on each Router object
     *
     * @param  {object} options
     * @return {object} Acacia instance
     */
    resources (options) {
        this.use(resources(options).routes());
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
