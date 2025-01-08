'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'passwordHash', {
      type: Sequelize.STRING(60),
      allowNull: false,
      defaultValue: ''
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'passwordHash')
  }
};
