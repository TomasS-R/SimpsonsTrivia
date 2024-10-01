class RoleManager {
  constructor() {
    this.roles = {
      USER: 'user',
      ADMIN: 'admin',
      MODERATOR: 'moderator',
      DEVELOPER: 'dev'
    };

    this.roleHierarchy = {
      [this.roles.USER]: 1,
      [this.roles.MODERATOR]: 2,
      [this.roles.ADMIN]: 3,
      [this.roles.DEVELOPER]:4
    };
  }

  // Rol por default que asigna el sistema al registrarse (Rol: user)
  getDefaultRole() {
    return this.roles.USER;
  }

  // Comprobacion de si el rol es valido
  isValidRole(role) {
    return Object.values(this.roles).includes(role);
  }

  // Asignacion de roles
  canAssignRole(assignerRole, roleToAssign) {
    return this.roleHierarchy[assignerRole] > this.roleHierarchy[roleToAssign];
  }

  // Obtener todos los roles
  getAllRoles() {
    return Object.values(this.roles);
  }

  // Obtener el rol segun la jerarquia
  getRoleHierarchy(role) {
    return this.roleHierarchy[role] || 0;
  }
}

module.exports = new RoleManager();
