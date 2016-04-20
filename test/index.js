'use strict';

process.env.NODE_ENV = 'test';

const request = require('supertest');
const should = require('should');
const Acacia = require('..');

let server;

const config = {
    port: 4661,
    security: {
        cors: {
            headers: 'Content-Type,Allow,Authorization',
            credentials: true,
            maxAge: 1,
            domains: [{
                origin: 'http://localhost',
                methods: ['GET', 'PUT', 'HEAD', 'POST', 'DELETE']
            }]
        }
    },
    responseTime: true
};

const config2 = {
    port: 4662,
    security: {
        cors: {
            domains: [{
                origin: 'http://localhost',
                methods: ['GET', 'PUT', 'HEAD', 'POST', 'DELETE']
            }]
        }
    }
};

function createApp(config, services) {
    const app = new Acacia(config);
    app.resources({path: __dirname + '/routes'});

    if (!services) app.services({path: __dirname + '/services'});
    else app.services();

    return app.listen();
}

describe('acacia main', () => {
    it('should has default port without config', done => {
        const app = new Acacia();
        app.context.config.port.should.eql(1664);
        done();
    });

    it('should throw if services options not exist', done => {
        const app = new Acacia();
        (() => app.services()).should.throw('options is required');
        done();
    });

    it('should throw if services options is not an object', done => {
        const app = new Acacia();
        (() => app.services(1)).should.throw('options must be an object');
        done();
    });

    it('should add x-response-time if config is enable', done => {
        server  = createApp(config);
        request(server)
            .get('/')
            .expect(200)
            .expect('x-response-time', /.*ms/)
            .end(() => server.close(() => done()));
    });
});

describe('acacia cors', () => {
    it('should not set unwanted headers', done => {
        server = createApp(config2);
        request(server)
            .get('/')
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
                res.headers['access-control-allow-origin'].should.eql('*');
                res.headers['access-control-allow-methods'].should.eql('GET,HEAD,PUT,POST,DELETE');
                should.not.exist(res.headers['Access-Control-Max-Age']);
                should.not.exist(res.headers['Access-Control-Allow-Credentials']);
                res.text.should.eql('hello');
                server.close(() => done());
                // done();
            });
    });

    it('should work without origin', done => {
        server = createApp(config);
        request(server)
            .get('/')
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
                res.headers['access-control-allow-origin'].should.eql('*');
                res.headers['access-control-allow-methods'].should.eql('GET,HEAD,PUT,POST,DELETE');
                res.headers['access-control-max-age'].should.eql('1');
                res.headers['access-control-allow-credentials'].should.eql('true');
                res.text.should.eql('hello');
                server.close(() => done());
                // done();
            });
    });

    it('should work with origin', done => {
        server = createApp(config);
        request(server)
            .get('/')
            .set('Origin', 'http://localhost')
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
                res.headers['access-control-allow-origin'].should.eql('http://localhost');
                res.headers['access-control-allow-methods'].should.eql('GET,HEAD,PUT,POST,DELETE');
                res.text.should.eql('hello');
                server.close(() => done());
            });
    });

    it('should not working with illegal origin', done => {
        server = createApp(config);
        request(server)
            .get('/')
            .set('Origin', 'pouet')
            .expect(404)
            .end(() => server.close(() => done()));
    });
});
