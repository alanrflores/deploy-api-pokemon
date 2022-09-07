const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('pokemon', {
    //UUID -- tipo de dato que se autogenera gracias el datatypes, alfanumerico
    //irrepetible, nos sirven para identificar nuestros pokemones..
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      //pk--> para poder luego hacer las relaciones, con la otra tabla
      primaryKey: true,
      //para que se autogenere el id a traves del default
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    life: {
      type: DataTypes.INTEGER
    },
    attack:{
      type: DataTypes.INTEGER
    },
    defending: {
      type: DataTypes.INTEGER
    },
    speed: {
      type: DataTypes.INTEGER
    },
    height: {
     type: DataTypes.FLOAT
    },
    weight:{
      type: DataTypes.FLOAT
    },
    image:{
      type: DataTypes.TEXT,
      
    },
   
    createInDb: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  });
};
