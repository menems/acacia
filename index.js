'use strict';

const Koa = require('koa');
const morgan = require('koa-morgan');
const convert = require('koa-convert');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');
const resources = require('koa-66-aggregate');
const servicesStack = require('services-stack');
const extend = require('extend');
const responseTime = require('koa-response-time');

class Acacia extends Koa {


    constructor(config) {
        super();

        // expose config
        this.context.config = config || { port: 1664};

        if (this.context.config.responseTime)
            this.use(responseTime());

        // logger
        if (this.env !== 'test')
            this.use(morgan(this.context.config.log || 'dev'));

        // cors
        if (this.context.config.security && this.context.config.security.cors)
            this.initCors(this.context.config.security.cors);
        // zlib
        this.use(convert(compress()));

        // body parser
        this.use(bodyParser());
    }

    initCors(config) {
        const options = {
            origin: req => {
                if (!req.header.origin ||
                    !config.domains ||
                    !config.domains.length ||
                    config.domains[0].origin === '*')
                    return '*';

                const has = config.domains.filter(domain =>
                    req.header.origin === domain.origin
                );
                return (has.length) ? has[0].origin : false;
            }
        };

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
    services(options) {
        if (!options)
            throw new TypeError('options is required');

        if (typeof options != 'object')
            throw new TypeError('options must be an object');

        options.context = options.context || {};

        const base = {
            config: this.context.config
        };

        options.context = extend(base, options.context);
        this.context.service = servicesStack(options).get;
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
    resources(options) {
        this.use(resources(options).routes());
        return this;
    }

    listen(fn) {
        return super.listen(this.context.config.port, () => {
            if (this.env === 'development')
                console.log('listening on ' + this.context.config.port);
            if (fn && typeof fn == 'function') fn.call(this);
        });
    }
}

module.exports = Acacia;
