
  import { Router } from 'express';
  import multer from 'multer';
  import {resolve, extname} from 'path';
  import { v4 as uuidv4  } from 'uuid';
  import verificarToken from '../middlewares/token';
  import { crearPublicacion, publicacionesMasGustadas, publicacionesPaginadas,
           publicacionesDeUsuario, borrarPublicacion, publicacionesUsuariosSeguidos,
           obterPublicacionPorId, agregarComentarioPublicacion, eliminarComentario,
           agregarMeGusta, publicacionesDeUsuarioPorId } from '../controllers/publicacion';
  import { devolverArchivoPublicacion } from '../controllers/devolver-imagenes';

  const router = Router();

  // config multer para destinar el guardado del archivo subido en la publicacion
  const storage = multer.diskStorage({

    destination : (req, file, cb) => {
      if(req.route.path === '/subir-publicacion'){
          cb(null, resolve(__dirname, '../uploads/publicacion'));
      }
      if(req.route.path === '/agregar-comentario/:id'){
          cb(null, resolve(__dirname, '../uploads/mensaje'));
      }
    },
    filename : (req, file, cb) => {
      cb(null, uuidv4() + extname(file.originalname))
    }
  });

  const multerConfig = multer({ storage });

  router.post('/subir-publicacion', verificarToken, multerConfig.single('archivo'), crearPublicacion);
  router.get('/obtener-publicaciones-mas-gustadas', verificarToken, publicacionesMasGustadas);
  router.get('/obtener-publicaciones-paginadas', verificarToken, publicacionesPaginadas);
  router.get('/publicaciones-usuario', verificarToken, publicacionesDeUsuario);
  router.get('/publicaciones-usuario/:id', verificarToken, publicacionesDeUsuarioPorId);
  router.get('/publicaciones-usuarios-seguidos', verificarToken, publicacionesUsuariosSeguidos);
  router.get('/publicacion-id/:id', verificarToken, obterPublicacionPorId);
  router.get('/agregar-me-gusta/:id/:type', verificarToken, agregarMeGusta);
  router.get('/devolver-archivo-publicacion/:archivo', devolverArchivoPublicacion);
  router.put('/agregar-comentario/:id',verificarToken, multerConfig.single('imagen'), agregarComentarioPublicacion);
  router.delete('/borrar-comentario/:publicacionId/:comentarioId', verificarToken, eliminarComentario);
  router.delete('/borrar-publicacion/:id', verificarToken, borrarPublicacion);


  export default router;
