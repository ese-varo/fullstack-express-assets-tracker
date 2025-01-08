'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'failedLoginAttempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    })

    await queryInterface.addColumn('Users', 'lastLoginAttempt', {
      type: Sequelize.DATE,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'failedLoginAttempts')
    await queryInterface.removeColumn('Users', 'lastLoginAttempt')
  }
};
