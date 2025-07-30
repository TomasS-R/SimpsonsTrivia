const cron = require('node-cron');
const config = require('../../../config');
const { createClient } = require('@supabase/supabase-js');
const queriesRedis = require('../../dbFiles/queriesRedis');

const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function deleteExpiredAnonymousUsers() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Error obteniendo los usuarios:', error.message);
      return;
    }

    const threeHoursAgo = new Date(Date.now() - (3 * 60 * 60 * 1000));
    
    const usersToDelete = data.users.filter(user => {
      const createdAt = new Date(user.created_at);
      return (
        (user.email === null || user.email === '') ||
        (user.app_metadata?.provider === 'anonymous' && createdAt < threeHoursAgo)
      );
    });

    if (usersToDelete.length === 0) {
      console.log('No se encontraron usuarios para eliminar');
      return;
    } else {
      console.log(`Se encontraron ${usersToDelete.length} usuarios para eliminar`);
    }

    for (const user of usersToDelete) {
      try {
        console.log(`Procesando usuario: ${user.id} (email: ${user.email || 'sin email'})`);
        
        // Primero eliminar datos de Redis si existen
        if (config.connectRedis) {
          await queriesRedis.deleteAnonymousUser(user.id);
        }
        
        // Verificar si el usuario aún existe antes de intentar eliminarlo
        const { error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user.id);
        
        if (getUserError && getUserError.message.includes('User not found')) {
          console.log(`Usuario ${user.id} ya fue eliminado`);
          continue;
        }
        
        // Eliminar de Supabase Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error(`Error eliminando usuario ${user.id}:`, deleteError.message);
        } else {
          console.log(`Usuario eliminado exitosamente: ${user.id}`);
        }
      } catch (err) {
        console.error(`Error procesando usuario ${user.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Error en la tarea programada:', err.message);
  }
}

// Programar la tarea para que se ejecute cada hora
const scheduledTask = cron.schedule('0 * * * *', async () => {
  console.log('Ejecutando tarea de limpieza de usuarios anónimos...');
  await deleteExpiredAnonymousUsers();
});

module.exports = {
  startScheduledTask: () => scheduledTask.start(),
};
