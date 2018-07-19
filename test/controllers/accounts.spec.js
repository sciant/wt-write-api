/* eslint-env mocha */
/* eslint-disable promise/no-promise-in-callback,promise/no-callback-in-promise,promise/no-nesting */
const { assert } = require('chai');
const request = require('supertest');

const { getWallet, getUploaders } = require('../utils/fixtures');
const Account = require('../../src/models/account');
const { ACCESS_KEY_HEADER, WALLET_PASSWORD_HEADER } = require('../../src/constants');

describe('controllers - accounts', function () {
  let server;

  before(() => {
    server = require('../../src/index');
  });

  after(() => {
    server.close();
  });

  describe('POST /account', () => {
    it('should save the account and return its secret key', (done) => {
      request(server)
        .post('/account')
        .send({
          wallet: getWallet(),
          uploaders: getUploaders(),
        })
        .expect(201)
        .expect('content-type', /application\/json/)
        .end((err, res) => {
          if (err) return done(err);
          try {
            assert.ok(res.body.accessKey);
            assert.ok((typeof res.body.accessKey) === 'string');
          } catch (e) {
            done(e);
          }
          Account.get(res.body.accessKey).then((account) => {
            assert.ok(account);
            assert.deepEqual(account, {
              wallet: getWallet(),
              uploaders: getUploaders(),
              accessKey: res.body.accessKey,
            });
            done();
          }).catch((e) => {
            done(e);
          });
        });
    });

    it('should return 422 if the data is invalid', (done) => {
      request(server)
        .post('/account')
        .send({
          wallet: { dummy: 'dummy' },
          uploaders: getUploaders(),
        })
        .expect(422)
        .end(done);
    });

    it('should return 422 if a required attribute is missing', (done) => {
      request(server)
        .post('/account')
        .send({
          uploaders: getUploaders(),
        })
        .expect(422)
        .end(done);
    });

    it('should return 422 if an unknown attribute is present', (done) => {
      request(server)
        .post('/account')
        .send({
          wallet: getWallet(),
          uploaders: getUploaders(),
          hobbies: ['gardening', 'fashion'],
        })
        .expect(422)
        .end(done);
    });
  });

  describe('PUT /account', () => {
    let accessKey;

    before(async () => {
      accessKey = await Account.create({
        wallet: getWallet(),
        uploaders: getUploaders(),
      });
    });

    it('should overwrite account with the given data', (done) => {
      let uploaders = { root: { dummy: {} } };
      request(server)
        .put('/account')
        .set(ACCESS_KEY_HEADER, accessKey)
        .set(WALLET_PASSWORD_HEADER, 'windingtree')
        .send({
          wallet: getWallet(),
          uploaders: uploaders,
        })
        .expect(204)
        .end((err, res) => {
          if (err) return done(err);
          Account.get(accessKey).then((account) => {
            assert.deepEqual(account, {
              wallet: getWallet(),
              uploaders: uploaders,
              accessKey: accessKey,
            });
            done();
          }).catch((e) => {
            done(e);
          });
        });
    });

    it('should return 422 if the data is invalid', (done) => {
      request(server)
        .put('/account')
        .set(ACCESS_KEY_HEADER, accessKey)
        .set(WALLET_PASSWORD_HEADER, 'windingtree')
        .send({
          wallet: { dummy: 'dummy' },
          uploaders: getUploaders(),
        })
        .expect(422)
        .end(done);
    });

    it('should return 422 if a required attribute is missing', (done) => {
      request(server)
        .put('/account')
        .set(ACCESS_KEY_HEADER, accessKey)
        .set(WALLET_PASSWORD_HEADER, 'windingtree')
        .send({
          uploaders: getUploaders(),
        })
        .expect(422)
        .end(done);
    });

    it('should return 422 if an unknown attribute is present', (done) => {
      request(server)
        .put('/account')
        .set(ACCESS_KEY_HEADER, accessKey)
        .set(WALLET_PASSWORD_HEADER, 'windingtree')
        .send({
          wallet: getWallet(),
          uploaders: getUploaders(),
          hobbies: ['gardening', 'fashion'],
        })
        .expect(422)
        .end(done);
    });
  });

  describe('DELETE /account', () => {
    it('should delete the given account', (done) => {
      Account.create({
        wallet: getWallet(),
        uploaders: getUploaders(),
      }).then((accessKey) => {
        request(server)
          .delete('/account')
          .set(ACCESS_KEY_HEADER, accessKey)
          .set(WALLET_PASSWORD_HEADER, 'windingtree')
          .expect(204)
          .end((err, res) => {
            if (err) return done(err);
            Account.get(accessKey).then((account) => {
              assert.isNotOk(account);
              done();
            }).catch(done);
          });
      }).catch(done);
    });
  });
});