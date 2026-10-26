const { verifyToken } = require('./jwt');
const { UnauthorizedError, ForbiddenError } = require('../errors');

function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }
  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

function optionalAuthenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
  } catch {
    req.user = null;
  }
  next();
}

function authorize(...roles) {
  const allowed = roles.flat();
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!allowed.includes(req.user.role)) {
      return next(new ForbiddenError(`Access restricted to: ${allowed.join(', ')}`));
    }
    next();
  };
}

module.exports = { authenticate, optionalAuthenticate, authorize };
