const { createUser, userExists, getRandomQuestion } = require('../src/dbFiles/queries');
const databaseManager = require('../src/dbFiles/databaseManager');

// Simula la base de datos
jest.mock('../src/dbFiles/databaseManager');

// Test para verificar que la función createUser inserta correctamente un nuevo user en la BD
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

// Test para comprobar que la función userExists verifica correctamente la existencia de un user en la BD
test('existUser into the database', async () => {
  const mockUser = {
    username: 'testuser'
  };

  databaseManager.query.mockResolvedValue({ rows: [mockUser] });

  const result = await userExists(mockUser.username);

  expect(result.rows[0].username).toBe('testuser');
});

// Test para verificar que la función getRandomQuestion devuelve una pregunta con la estructura correcta
test('getRandomQuestion returns a question with correct structure', async () => {
  const mockQuestion = {
    id: 1,
    quote: "D'oh!",
    correct_character: 'Homer Simpson',
    incorrect_options: ['Bart Simpson', 'Lisa Simpson', 'Marge Simpson']
  };

  // Simular la respuesta de la base de datos
  databaseManager.query.mockResolvedValue({ rows: [mockQuestion] });

  const result = await getRandomQuestion();

  // Verificar que el resultado tenga la estructura correcta
  expect(result).toHaveProperty('id');
  expect(result).toHaveProperty('quote');
  expect(result).toHaveProperty('correct_character');
  expect(result).toHaveProperty('incorrect_options');

  // Verificar que las opciones incorrectas sean 3
  expect(result.incorrect_options).toHaveLength(3);

  // Verificar que la respuesta correcta esté presente en las opciones
  expect(result.incorrect_options).toEqual(expect.arrayContaining(mockQuestion.incorrect_options));
  expect(result.correct_character).toBe(mockQuestion.correct_character);
});

// Test para comprobar que la función getRandomQuestion maneja correctamente un resultado vacío
test('getRandomQuestion handles empty result', async () => {
  databaseManager.query.mockResolvedValue({ rows: [] });

  const result = await getRandomQuestion();

  expect(result).toBeUndefined();
});