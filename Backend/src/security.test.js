const { authenticate, optionalAuthenticate, authorize } = require('./shared/auth/middleware');
const { signToken, verifyToken } = require('./shared/auth/jwt');
const { UnauthorizedError, ForbiddenError, BadRequestError, NotFoundError } = require('./shared/errors');

describe('Security Middleware & Token Authentication', () => {
  const validPayload = { id: 'usr-123', email: 'pro@gamersg.com', role: 'player' };
  let validToken;

  beforeAll(() => {
    validToken = signToken(validPayload);
  });

  describe('JWT Utilities', () => {
    it('signs and verifies valid tokens', () => {
      const decoded = verifyToken(validToken);
      expect(decoded.id).toBe(validPayload.id);
      expect(decoded.email).toBe(validPayload.email);
      expect(decoded.role).toBe(validPayload.role);
    });

    it('rejects tampered tokens', () => {
      const tampered = validToken.slice(0, -5) + 'abcde';
      expect(() => verifyToken(tampered)).toThrow();
    });
  });

  describe('authenticate middleware', () => {
    it('rejects requests without Authorization header with 401', () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('rejects requests with invalid authorization scheme (not Bearer)', () => {
      const req = { headers: { authorization: 'Basic 12345' } };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('rejects requests with forged token with 401', () => {
      const req = { headers: { authorization: 'Bearer fake.invalid.token' } };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('attaches req.user and calls next() on valid token', () => {
      const req = { headers: { authorization: `Bearer ${validToken}` } };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('usr-123');
      expect(req.user.role).toBe('player');
    });
  });

  describe('optionalAuthenticate middleware', () => {
    it('sets req.user = null and calls next() when no token is present', () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      optionalAuthenticate(req, res, next);
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeNull();
    });

    it('sets req.user = null and calls next() on invalid token (graceful public degradation)', () => {
      const req = { headers: { authorization: 'Bearer bad.token' } };
      const res = {};
      const next = jest.fn();

      optionalAuthenticate(req, res, next);
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeNull();
    });

    it('attaches req.user on valid token', () => {
      const req = { headers: { authorization: `Bearer ${validToken}` } };
      const res = {};
      const next = jest.fn();

      optionalAuthenticate(req, res, next);
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user.role).toBe('player');
    });
  });

  describe('authorize middleware', () => {
    it('rejects 401 Unauthorized if req.user is missing', () => {
      const middleware = authorize('admin');
      const req = {};
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('rejects 403 Forbidden if user role is not in allowed roles', () => {
      const middleware = authorize(['admin', 'organizer']);
      const req = { user: { id: 'p1', role: 'player' } };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('allows access if user role matches single allowed role', () => {
      const middleware = authorize('player');
      const req = { user: { id: 'p1', role: 'player' } };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('allows access if user role is included in allowed role array', () => {
      const middleware = authorize(['org', 'player', 'admin']);
      const req = { user: { id: 'p1', role: 'player' } };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('HTTP Error Status Code Standards', () => {
    it('has correct HTTP status codes', () => {
      expect(new BadRequestError().statusCode).toBe(400);
      expect(new UnauthorizedError().statusCode).toBe(401);
      expect(new ForbiddenError().statusCode).toBe(403);
      expect(new NotFoundError().statusCode).toBe(404);
    });
  });

  describe('Route Middleware Security Stack Verification', () => {
    const socialRoutes = require('./modules/social/social.routes');
    const teamRoutes = require('./modules/teams/teams.routes');
    const recruitmentRoutes = require('./modules/recruitment/recruitment.routes');
    const tournamentRoutes = require('./modules/tournaments/tournaments.routes');
    const adminRoutes = require('./modules/admin/admin.routes');

    function hasAuthenticate(router, path, method) {
      const layer = router.stack.find(
        (l) => l.route && l.route.path === path && l.route.methods[method.toLowerCase()]
      );
      if (!layer) return false;
      return layer.route.stack.some((s) => s.handle === authenticate || s.handle.name === 'authenticate');
    }

    it('guards social post creation with authenticate', () => {
      expect(hasAuthenticate(socialRoutes, '/posts', 'post')).toBe(true);
    });

    it('guards social post liking with authenticate', () => {
      expect(hasAuthenticate(socialRoutes, '/posts/:id/like', 'post')).toBe(true);
    });

    it('guards social post commenting with authenticate', () => {
      expect(hasAuthenticate(socialRoutes, '/posts/:id/comments', 'post')).toBe(true);
    });

    it('guards social follow with authenticate', () => {
      expect(hasAuthenticate(socialRoutes, '/follow', 'post')).toBe(true);
    });

    it('guards team creation with authenticate', () => {
      expect(hasAuthenticate(teamRoutes, '/', 'post')).toBe(true);
    });

    it('guards team member addition with authenticate', () => {
      expect(hasAuthenticate(teamRoutes, '/:id/members', 'post')).toBe(true);
    });

    it('guards recruitment application with authenticate', () => {
      expect(hasAuthenticate(recruitmentRoutes, '/postings/:postingId/apply', 'post')).toBe(true);
    });

    it('guards scrim creation with authenticate', () => {
      expect(hasAuthenticate(tournamentRoutes, '/scrims', 'post')).toBe(true);
    });

    it('guards scrim credentials update with authenticate', () => {
      expect(hasAuthenticate(tournamentRoutes, '/scrims/:id/credentials', 'patch')).toBe(true);
    });

    it('guards scrim team registration with authenticate', () => {
      expect(hasAuthenticate(tournamentRoutes, '/scrims/:id/register', 'post')).toBe(true);
    });

    it('guards entire admin router with router-level authenticate', () => {
      const topLevelMiddlewares = adminRoutes.stack
        .filter((l) => !l.route)
        .map((l) => l.handle);
      expect(topLevelMiddlewares).toContain(authenticate);
    });
  });
});
