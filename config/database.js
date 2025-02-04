import { Sequelize } from "sequelize";


const sequelize = new Sequelize('so_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '+07:00',
});



// Sinkronisasi database
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synchronized');
    })
    .catch((error) => {
        console.error('Error synchronizing database:', error);
    });



export default sequelize;