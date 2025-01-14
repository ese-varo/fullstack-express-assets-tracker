'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'manager'),
      allowNull: false,
      defaultValue: 'manager'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'role')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";')
  }
};
