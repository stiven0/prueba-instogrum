
  import express,{Application} from 'express';
  import { urlencoded, json } from 'body-parser';

  const app : Application = express();

  // importar rutas
  import routesUsuario from './routes/routes-user';
  import routesPublicacion from './routes/routes-publicacion';
  import routesSeguimientos from './routes/routes-seguido-seguidor';

  // middlewares
  app.use(urlencoded({ extended : true }));
  app.use(json());

  // cors
  app.use((req, res, next) => {
  	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Authorization, token, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  	next();
  });

  // renderizar rutas
  app.use('/api', routesUsuario);
  app.use('/api', routesPublicacion);
  app.use('/api', routesSeguimientos);

  export default app;
