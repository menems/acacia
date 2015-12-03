'use strict';

process.env.NODE_ENV = 'test';

const request = require('supertest');
const should = require('should');
const Acacia = require('..');

let server;

describe('acacia cors', () => {
    before(done => {
        const config = {
            port: 4661,
            security: {
                cors: {
                    headers: 'Content-Type,Allow,Authorization',
                    credential: true,
                    domains: [{
                        origin: 'http://localhost',
                        methods: ['GET', 'PUT', 'HEAD', 'POST', 'DELETE']
                    }]
                }
            }
        };

        const app = new Acacia(config);
        app.resources({
            path: __dirname + '/routes'
        });
        server = app.listen(done);
    });

    after(done => {
        server.close();
        done();
    });

    it('should work without origin', done => {
        request(server)
            .get('/')
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
                res.headers['access-control-allow-origin'].should.eql('*');
                res.headers['access-control-allow-methods'].should.eql('GET,HEAD,PUT,POST,DELETE');
                res.text.should.eql('hello');
                done();
            });
    });

    it('should work with origin', done => {
        request(server)
            .get('/')
            .set('Origin', 'http://localhost')
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
                res.headers['access-control-allow-origin'].should.eql('http://localhost');
                res.headers['access-control-allow-methods'].should.eql('GET,HEAD,PUT,POST,DELETE');
                res.text.should.eql('hello');
                done();
            });
    });

    it('should not working with illegal origin', done => {
        request(server)
            .get('/')
            .set('Origin', 'pouet')
            .expect(404)
            .end(done);
    });
});
