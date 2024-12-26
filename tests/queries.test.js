const { createUser, emailExists, usernameExists, getRandomQuestion } = require('../src/dbFiles/queries');
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

// Test para comprobar que las funciones verifican correctamente la existencia de usuarios en la BD
test('user existence verification in database', async () => {
    const mockUserByEmail = {
        email: 'test@gmail.com',
        username: 'testuser'
    };

    const mockUserByUsername = {
        email: 'test@gmail.com',
        username: 'testuser'
    };

    // Mock para la consulta de email
    databaseManager.query
        .mockResolvedValueOnce({ rows: [mockUserByEmail] })  // Para userExists
        .mockResolvedValueOnce({ rows: [mockUserByUsername] }); // Para usernameExists

    // Verificar existencia por email
    const emailResult = await emailExists(mockUserByEmail.email);
    expect(emailResult.rows[0].email).toBe('test@gmail.com');

    // Verificar existencia por username
    const usernameResult = await usernameExists(mockUserByUsername.username);
    expect(usernameResult.rows[0].username).toBe('testuser');
});

// Test para verificar que la función getRandomQuestion devuelve una pregunta con la estructura correcta
test('getRandomQuestion returns a question with correct structure', async () => {
  const mockQuestion = {
    id: 1,
    quote: "D'oh!",
    correct_character_id: 1,
    correct_character_name: 'Homer Simpson',
    incorrect_options: [
      { id: 2, name: 'Bart Simpson' },
      { id: 3, name: 'Lisa Simpson' },
      { id: 4, name: 'Marge Simpson' }
    ]
  };

  // Simular la respuesta de la base de datos
  databaseManager.query.mockResolvedValue({ rows: [mockQuestion] });

  const result = await getRandomQuestion();

  // Verificar que el resultado tenga la estructura correcta
  expect(result).toHaveProperty('id');
  expect(result).toHaveProperty('quote');
  expect(result).toHaveProperty('correct_character');
  expect(result).toHaveProperty('incorrect_options');

  // Verificar la estructura del personaje correcto
  expect(result.correct_character).toEqual({
    id: mockQuestion.correct_character_id,
    name: mockQuestion.correct_character_name
  });

  // Verificar que las opciones incorrectas sean 3
  expect(result.incorrect_options).toHaveLength(3);

  // Verificar que cada opción incorrecta tenga id y name
  result.incorrect_options.forEach(option => {
    expect(option).toHaveProperty('id');
    expect(option).toHaveProperty('name');
  });

  // Verificar que las opciones incorrectas coincidan con el mock
  expect(result.incorrect_options).toEqual(expect.arrayContaining(mockQuestion.incorrect_options));
});

// Test para comprobar que la función getRandomQuestion maneja correctamente un resultado vacío
test('getRandomQuestion handles empty result', async () => {
  databaseManager.query.mockResolvedValue({ rows: [] });

  const result = await getRandomQuestion();

  expect(result).toBeUndefined();
});