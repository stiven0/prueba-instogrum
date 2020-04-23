
  require('dotenv').config();
  import app from './app';
  import { connect } from 'mongoose';
  import chalk from 'chalk';

  async function main(){
    const options = {useNewUrlParser : true, useCreateIndex : true, useFindAndModify : false, useUnifiedTopology : true};

    try {
      await connect(String(process.env.DB), options);
      console.log(chalk.bgBlackBright('Conexion a la base de datos establecida'));
      app.listen(process.env.PORT);
      console.log(chalk.bgBlueBright(`Servidor corriendo en el puerto : ${ process.env.PORT }`));

    } catch(e) {
        console.log(e);
    }
  }

  main();
