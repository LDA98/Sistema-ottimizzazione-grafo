'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('modification_requests', [
      {
        modelId: 1,
        userId: 3,
        coordinates: JSON.stringify([{ x: 1, y: 2 }]),
        status: 'Rejected',
        tokensCost: 0.01,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: 1,
        userId: 2,
        coordinates: JSON.stringify([{ x: 5, y: 6 }, { x: 7, y: 8 }, { x: 3, y: 4 }]),
        status: 'Pending',
        tokensCost: 0.03,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: 1,
        userId: 2,
        coordinates: JSON.stringify([{ x: 2, y: 3 }, { x: 3, y: 3 }]),
        status: 'Pending',
        tokensCost: 0.02,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: 3,
        userId: 3,
        coordinates: JSON.stringify([{ x: 1, y: 2 }]),
        status: 'Pending',
        tokensCost: 0.01,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: 3,
        userId: 2,
        coordinates: JSON.stringify([{ x: 5, y: 6 }, { x: 7, y: 8 }, { x: 3, y: 4 }]),
        status: 'Pending',
        tokensCost: 0.03,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelId: 2,
        userId: 2,
        coordinates: JSON.stringify([{ x: 2, y: 3 }, { x: 3, y: 3 }]),
        status: 'Pending',
        tokensCost: 0.02,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('modification_requests', null, {});
  },
};
