
  import { Router } from 'express';
  import multer from 'multer';
  import {resolve, extname} from 'path';
  import { v4 as uuidv4  } from 'uuid';
  import { crearUsuario, login, personasMasSeguidas, usuariosPaginados, usuarioPorName,
           buscarPersona, actualizarInfoUsuario, actualizarPassword, generateToken,
           comprobarNombreDeUsuario, retornarUsuarioToken, agregarOquitarNumeroSeguidoresUsuario,
           usuarioPorId } from '../controllers/usuario';
  import { devolverImgUsuario } from '../controllers/devolver-imagenes';
  import verificarToken from '../middlewares/token';
  import verificarRoleAdmin from '../middlewares/role';

  const router = Router();


  // definimos propiedas del archivo a subir (donde se almacena, y su nombre)
  const storage = multer.diskStorage({
    destination : resolve(__dirname, '../uploads/perfil'),
    filename : (req, file, cb) => {
      cb(null, uuidv4() + extname(file.originalname));
    }
  });

  const multerConfig = multer({storage});

  router.post('/crear-usuario', crearUsuario);
  router.post('/login', login);
  router.post('/agregar-quitar-numero-seguidores-usuario/:id/:type', agregarOquitarNumeroSeguidoresUsuario);
  router.get('/personas-mas-seguidas', verificarToken, personasMasSeguidas);
  router.get('/usuarios', verificarToken, usuariosPaginados);
  router.get('/usuario/:name', verificarToken, usuarioPorName);
  router.get('/busqueda-usuario/:busqueda', verificarToken, buscarPersona);
  router.get('/busqueda-nombre-usuario/:nombre', comprobarNombreDeUsuario);
  router.get('/generar-token', verificarToken, generateToken);
  router.get('/devolver-img-usuario/:image', devolverImgUsuario);
  router.get('/usuario-token', verificarToken, retornarUsuarioToken);
  router.get('/usuario-id/:id', verificarToken, usuarioPorId);
  router.put('/actualizar-usuario', verificarToken, multerConfig.single('imagen'), actualizarInfoUsuario);
  router.put('/actualizar-password', verificarToken, actualizarPassword);

  export default router;
