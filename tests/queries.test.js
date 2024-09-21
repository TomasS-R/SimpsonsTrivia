const { createUser, userExists, getRandomQuestion } = require('../src/dbFiles/queries');
const { validateEmail } = require('../src/controllers/triviaControllers')
const databaseManager = require('../src/dbFiles/databaseManager');

// Simula la base de datos
jest.mock('../src/dbFiles/databaseManager');

test('createUser inserts a new user into the database', async () => {
  const mockUser = {
    //email: 'test@gmail.com',
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

test('getRandomQuestion returns a question with correct structure', async () => {
  const mockQuestion = {
    id: 1,
    quote: "D'oh!",
    correct_character: 'Homer Simpson',
    incorrect_options: ['Bart Simpson', 'Lisa Simpson', 'Marge Simpson']
  };

  databaseManager.query.mockResolvedValue({ rows: [mockQuestion] });

  const result = await getRandomQuestion();

  expect(result).toEqual(mockQuestion);
  expect(result.quote).toBeDefined();
  expect(result.correct_character).toBeDefined();
  expect(result.incorrect_options).toHaveLength(3);
});

test('getRandomQuestion handles empty result', async () => {
  databaseManager.query.mockResolvedValue({ rows: [] });

  const result = await getRandomQuestion();

  expect(result).toBeUndefined();
});
describe('validateEmail', () => {
  test('validates correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  test('invalidates incorrect email', () => {
    expect(validateEmail('notanemail')).toBe(false);
  });
});