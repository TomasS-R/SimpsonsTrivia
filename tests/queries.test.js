const { createUser, userExists } = require('../src/dbFiles/queries');
const databaseManager = require('../src/dbFiles/databaseManager');

// Simula la base de datos
jest.mock('../src/dbFiles/databaseManager');

test('createUser inserts a new user into the database', async () => {
  const mockUser = {
    username: 'testuser',
    password_hash: 'pass01',
    role: 'user',
    created_at: new Date()
  };

  databaseManager.query.mockResolvedValue({ rows: [mockUser] });

  const result = await createUser(mockUser.username, mockUser.password_hash, mockUser.role, mockUser.created_at);

  expect(result.rows[0].username).toBe('testuser');
  expect(result.rows[0].role).toBe('user');
});

test('existUser into the database', async () => {
  const mockUser = {
    username: 'testuser'
  };

  databaseManager.query.mockResolvedValue({ rows: [mockUser] });

  const result = await userExists(mockUser.username);

  expect(result.rows[0].username).toBe('testuser');
});

test('existUser into the database', async () => {
  const mockUser = {
    username: 'testuser'
  };

  databaseManager.query.mockResolvedValue({ rows: [mockUser] });

  const result = await userExists(mockUser.username);

  expect(result.rows[0].username).toBe('testuser');
});
