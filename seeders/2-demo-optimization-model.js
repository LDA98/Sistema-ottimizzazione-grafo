'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('optimization_models', [
      {
        userId: 2, 
        graph: JSON.stringify(JSON.stringify([
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 1],
          [0, 0, 1, 1, 0, 1, 1, 0],
          [0, 0, 1, 0, 0, 0, 1, 0],
          [0, 0, 0, 0, 0, 0, 1, 0],
          [1, 1, 1, 0, 1, 0, 1, 0],
          [0, 0, 0, 0, 1, 0, 1, 0]
        ])),
        tokensCost: 1.225,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2, 
        graph: JSON.stringify(JSON.stringify([
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 1],
          [0, 1, 1, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 1, 0, 1],
          [0, 0, 0, 1, 0, 0, 0, 0],
          [0, 0, 1, 0, 1, 0, 1, 0]
        ])),
        tokensCost: 0.9,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 3, 
        graph: JSON.stringify(JSON.stringify([
          [0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 1, 1],
          [1, 0, 0, 0, 1, 0, 0, 0],
          [0, 0, 1, 0, 0, 0, 0, 0]
        ])),
        tokensCost: 0.4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('optimization_models', null, {});
  },
};
