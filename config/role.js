const roles = {
    user: {
      can: ['read','edit'],
    },
    admin1: {
      can: ['read', 'edit'],
    },
    admin2: {
        can: ['read', 'delete'],
    },
    superadmin: {
      can: ['read', 'edit', 'delete'],
    },
};

module.exports = roles;
