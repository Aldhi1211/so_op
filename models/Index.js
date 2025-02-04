import Barang from './Barang.js'; // Import model Barang
import StockIn from './StockIn.js'; // Import model StockIn

// Definisikan relasi antar model
StockIn.belongsTo(Barang, { foreignKey: 'id_barang', as: 'barang' });
Barang.hasMany(StockIn, { foreignKey: 'id_barang', as: 'stockIn' });

// Ekspor model
export { Barang, StockIn };
