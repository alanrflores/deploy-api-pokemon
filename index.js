//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const server = require('./src/app.js');
const { conn, Tipo } = require('./src/db.js');
const axios = require('axios');
const { PORT } = process.env;


// Syncing all the models at once.

//force:true, para que se reinicie la base de datos cada vez que se levanta el servidor
conn.sync({ force: true }).then(async () => {
  //const dataTypes = await axios.get('https://pokeapi.co/api/v2/type');
  
 // await Tipo.bulkCreate(dataTypes.data.results);
 server.listen(PORT, () => console.log(`Listen on port ${PORT}`));
  // server.listen(3001, () => {
  //   console.log('%s listening at 3001'); // eslint-disable-line no-console
  //   console.log('types created'); // eslint-disable-line no-console
  // });
});

//problemas con la muerte de node.js cada vez que el servidor al que llama se niega a conectarse. Esto evita eso
process.on('uncaughtException', function (err) {
  console.log(err);
}); 
