'use strict';
const bcrypt = require('bcrypt');


/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword1 = await bcrypt.hash('admin', 10); 
    const hashedPassword2 = await bcrypt.hash('user1', 10);
    const hashedPassword3 = await bcrypt.hash('user2', 10);
    const hashedPassword4 = await bcrypt.hash('user3', 10);

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@test.com',
        password: hashedPassword1, 
        tokens: 1000,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user1@test.com',
        password: hashedPassword2,
        tokens: 2.425,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user2@test.com',
        password: hashedPassword3,
        tokens: 6.98,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user3@nomoneytest.com',
        password: hashedPassword4,
        tokens: 0,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
