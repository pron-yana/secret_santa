import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGetCurrentUser, handleGetUserById } from './user.js';
import User from '../models/user.js';
import { verifySession } from '../utils/sessionManager.js';
import { parseCookies } from '../utils/parseCookies.js';

vi.mock('../models/user.js');
vi.mock('../utils/sessionManager.js');
vi.mock('../utils/parseCookies.js');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {},
      url: '',
      on: vi.fn(),
    };

    res = {
      writeHead: vi.fn(),
      end: vi.fn(),
    };

    vi.clearAllMocks();
  });

  describe('handleGetCurrentUser', () => {
    it('should return 401 if no sessionId cookie is provided', async () => {
      parseCookies.mockReturnValue({});
      await handleGetCurrentUser(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(401, {
        'Content-Type': 'application/json',
      });
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ message: 'Unauthorized' })
      );
    });

    it('should return 401 if session is invalid', async () => {
      parseCookies.mockReturnValue({ sessionId: 'invalid-session' });
      verifySession.mockResolvedValue(null);

      await handleGetCurrentUser(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(401, {
        'Content-Type': 'application/json',
      });
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ message: 'Unauthorized' })
      );
    });

    it('should return 404 if user is not found', async () => {
      parseCookies.mockReturnValue({ sessionId: 'valid-session' });
      verifySession.mockResolvedValue({ userId: '123' });
      User.findById.mockResolvedValue(null);

      await handleGetCurrentUser(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(404, {
        'Content-Type': 'application/json',
      });
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ message: 'User not found' })
      );
    });

    it('should return 200 and the user if session and user are valid', async () => {
      parseCookies.mockReturnValue({ sessionId: 'valid-session' });
      verifySession.mockResolvedValue({ userId: '123' });
      const mockUser = { id: '123', username: 'testuser' };
      User.findById.mockResolvedValue(mockUser);

      await handleGetCurrentUser(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/json',
      });
      expect(res.end).toHaveBeenCalledWith(JSON.stringify(mockUser));
    });
  });

  describe('handleGetUserById', () => {
    it('should return 400 if no userId is provided', async () => {
      req.url = '/api/user/';
      await handleGetUserById(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(400, {
        'Content-Type': 'application/json',
      });
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ message: 'Ідентифікатор користувача є обов’язковим' })
      );
    });

    it('should return 404 if user is not found', async () => {
      req.url = '/api/user/123';
      User.findById.mockResolvedValue(null);

      await handleGetUserById(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(404, {
        'Content-Type': 'application/json',
      });
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify({ message: 'Користувача не знайдено' })
      );
    });

    it('should return 200 and the user if userId is valid', async () => {
      req.url = '/api/user/123';
      const mockUser = { id: '123', username: 'testuser' };
      User.findById.mockResolvedValue(mockUser);

      await handleGetUserById(req, res);

      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/json',
      });
      expect(res.end).toHaveBeenCalledWith(JSON.stringify(mockUser));
    });
  });
});
