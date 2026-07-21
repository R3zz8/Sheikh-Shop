const jwt = require('jsonwebtoken');

const payload = {
  id: 'mock-user-id',
  email: 'customer@sheikhshop.com',
  role: 'SUPERADMIN'
};

const secret = 'super_secret_production_ready_jwt_key_at_least_32_characters_long_for_security';

const token = jwt.sign(payload, secret, {
  algorithm: 'HS256',
  issuer: 'sheikh-shop',
  audience: 'sheikh-shop-users',
  expiresIn: '7d',
});

console.log(token);
