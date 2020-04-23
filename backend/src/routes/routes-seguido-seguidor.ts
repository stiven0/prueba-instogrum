
  import { Router } from 'express';
  import verificarToken from '../middlewares/token';
  import { seguirUsuario, obtenerUsuariosSeguidos, eliminarSeguimiento, obtenerSeguidores,
           contarSeguidoresOrSeguidor } from '../controllers/seguido-seguidor';

  const router = Router();

  router.get('/crear-seguimiento/:seguido', verificarToken, seguirUsuario);
  router.get('/obtener-seguimientos-usuario/:id', verificarToken, obtenerUsuariosSeguidos);
  router.get('/obtener-seguidores-usuario/:id', verificarToken, obtenerSeguidores);
  router.get('/obtener-numero-seguidores-seguidos/:id/:type', verificarToken, contarSeguidoresOrSeguidor);
  router.delete('/eliminar-seguimiento/:id', verificarToken, eliminarSeguimiento);

  export default router;
