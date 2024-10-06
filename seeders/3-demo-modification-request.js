'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('modification_requests', [
      {
        modelId: 1,
        userId: 3,
        coordinates: '[[1, 2]]',
        status: 'Pending',
        tokensCost: 0.01,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: 1,
        userId: 2,
        coordinates: '[[5, 6], [7, 8], [3, 4]]',
        status: 'Pending',
        tokensCost: 0.03,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: 2,
        userId: 2,
        coordinates: '[[2, 3], [3, 3]]',
        status: 'Pending',
        tokensCost: 0.02,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('modification_requests', null, {});
  },
};
