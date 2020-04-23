
  require('dotenv').config();
  import Usuario from '../models/usuario';
  import { hashSync, compareSync } from 'bcrypt';
  import { sign } from 'jsonwebtoken';
  import { Request, Response } from 'express';
  import { existsSync, unlinkSync } from 'fs';
  import { resolve } from 'path';
  import { pick } from 'underscore';

  interface Usuario {
    _id : string;
    nombre_completo : string;
    nombre_usuario : string;
    correo : string;
    password : string;
    imagen : string;
    descripcion : string;
    role : string;
    seguidores : number;
    seguidos : number;
    fecha_creacion : string;
  }

  // register de usuario
  export const crearUsuario = async (req:Request, res:Response) => {

    const result = /^(?=\w*\d)(?=\w*)(?=\w*[a-z])\S{4,16}$/.test(req.body.password);

    if(result){
      const usuarioNuevo = new Usuario({
        nombre_completo : req.body.nombre_completo,
        nombre_usuario : req.body.nombre_usuario,
        correo : req.body.correo,
        password : hashSync(req.body.password, 10),
        fecha_creacion : new Date().getTime()
      });

      usuarioNuevo.save((error:Error, usuarioDB) => {
        if(error) return res.status(500).json({ message : error.message });

        return res.status(201).json({ usuario : true });
      });
    } else {
        return res.status(400).json({ message : 'La contraseña es incorrecta, minimo debe tener 4 caracteres, un digito numerico y el texto en minuscula'});
    }
  };

  // comprobar nickname de usuario
  export const comprobarNombreDeUsuario = (req:Request, res:Response) => {
    const nombre = req.params.nombre;

    Usuario.findOne({ nombre_usuario : nombre }).exec((error:Error, usuarioDB) => {
      if(error) return res.status(500).json({ message : error.message });
      if(!usuarioDB) return res.status(200).json({ usuario : true });

      return res.status(200).json({ usuario : false });
    });
  };

  // login de usuario
  export const login = async (req:Request, res:Response) => {

    const datosUsuario = await req.body;

    Usuario.findOne({ correo : datosUsuario.correo }, (error:Error, usuarioDB:Usuario) => {
      if(error) return res.status(500).json({ message : error.message });
      if(!usuarioDB) return res.status(500).json({ message : 'Error, datos de usuario incorrectos' });
      if(!compareSync(datosUsuario.password, usuarioDB.password)) return res.status(400).json({ message : 'Error, datos de usuario incorrectos' });

      const token = sign({ usuario : usuarioDB._id }, String(process.env.TOKEN), { expiresIn : '3h' });

      return res.status(200).json({ token });
    });
  };

  // metodo para aumentar o disminuir el numero de seguidores de un usuario
  export const agregarOquitarNumeroSeguidoresUsuario = (req:Request, res:Response) => {
    const idSeguido = req.params.id;
    const type = req.params.type;

    Usuario.findById(idSeguido, (error:Error, usuarioDB:Usuario) => {
      if(error) return res.status(500).json({ message : error.message });
      if(!usuarioDB) return res.status(404).json({ message : 'Este usuario no esta disponible' });

      switch(type){

        case 'agregar' :

        usuarioDB.seguidores += 1;
        (async () => {
          try {
            const user = await (usuarioDB as any).save();
            return res.status(200).json(user);
          } catch (e) {
            return res.status(500).json({ message : e });
          }
        })();
        break;

        case 'quitar' :

        usuarioDB.seguidores -= 1;
        (async () => {
          try {
            const user = await (usuarioDB as any).save();
            return res.status(200).json(user);
          } catch (e) {
            return res.status(500).json({ message : e });
          }
        })();
        break;

        default : return res.status(500).json({ message : 'Ha ocurrido un error' });
      }
    });
  };

  // devolver los usuarios con mas seguidores
  export const personasMasSeguidas = (req:Request, res:Response) => {

    const desde = +req.query.desde || 0;
    const hasta = +req.query.hasta || 10;

    Usuario.find({ seguidores : {"$gt" : 0}   })
           .skip(desde)
           .limit(hasta)
           .sort({ seguidores : -1 })
           .exec((error:Error, usuariosDB:[Usuario]) => {
                if(error) return res.status(500).json({ message : error.message });

                // si ningun usuario tiene seguidores va retornar los usuarios creados recientemente
                if((usuariosDB as any) == []){
                  usuariosPaginados(req, res);
                  return;
                };

                return res.status(200).json({ usuarios : usuariosDB });
          });
  };

  // devolver los usuarios de la plataforma de forma paginada
  export const usuariosPaginados = (req:Request, res:Response) => {

    const desde = +req.query.desde || 0;
    const hasta = +req.query.hasta || 10;

    Usuario.find()
           .sort({ nombre_usuario : -1 })
           .skip(desde)
           .limit(hasta)
           .exec((error:Error, usuariosDB:[Usuario]) => {
             if(error) return res.status(500).json({ message : error.message });

             return res.status(200).json({ usuarios : usuariosDB });
           });
  };

  // devolver un usuario por su nombre
  export const usuarioPorName = async (req:Request, res:Response) => {
    const usuarioName = req.params.name;
    try {
      const usuarioDB = await Usuario.findOne({ nombre_usuario : usuarioName });
      return res.status(200).json(usuarioDB);

    }catch(e){
      return res.status(500).json({ e : e.message});
    }
  };

  // devolver un usuario por su id
  export const usuarioPorId = async (req:Request, res:Response) => {
    const usuarioID = req.params.id;
    try {
      const usuarioDB = await Usuario.findById(usuarioID);
      return res.status(200).json(usuarioDB);

    }catch(e){
      return res.status(500).json({ e : e.message});
    }
  };

  // devolver usuarios que cumplan con una busqueda realizada
  export const buscarPersona = (req:Request, res:Response) => {

    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');

    Usuario.find({ "$or" : [{nombre_completo : regex}, {nombre_usuario : regex}] })
            .limit(15)
            .exec((error:Error, usuariosDB:[Usuario]) => {
              if(error) return res.status(500).json({ message : error.message });

              return res.status(200).json({ usuarios : usuariosDB });
            });

  };

  // actualiza datos de usuario (imagen, nombre_usuario, nombre_completo, descripcion)
  export const actualizarInfoUsuario = (req:Request, res:Response) => {

    const usuarioId = (req as any).usuario;
    const datosUsuario = pick(req.body, ['nombre_usuario', 'correo', 'nombre_completo', 'imagen', 'descripcion']);

    // se actualiza imagen
    if(req.file){

      const fileRuta = req.file.path;
      const extArchivo = req.file.originalname.split('.')[1];

      const EXT_VALIDAS : Array<string> = ['jpeg', 'jpg', 'gif', 'png', 'JPG', 'JPEG', 'GIF', 'PNG'];

      // eliminamos el archivo, ya que no corresponde a una imagen de formato valida
      if(!EXT_VALIDAS.includes(extArchivo)){
          eliminarArchivo(fileRuta);
          return res.status(400).json({ message : 'El archivo subido no corresponde a un formato de imagen valido, por favor intenta de nuevo con otro archvo' });
      }

      Usuario.findById(usuarioId).exec((error:Error, usuario:Usuario) => {
        if(error) return res.status(500).json({ message : error.message });

        if(usuario && usuario.imagen) elimarImagenUsuario(usuario.imagen);
        datosUsuario.imagen = req.file.filename;

        actualizarUsuario(usuarioId, datosUsuario, res);
      });

    //no se actualiza imagen
    } else {
      actualizarUsuario(usuarioId, datosUsuario, res);
    }
  };

  // metodo para actualizar password de usuario
  export const actualizarPassword = (req:Request, res:Response) => {

    const usuarioId = (req as any).usuario;
    const datos = pick(req.body, ['passwordNuevo', 'passwordActual']);

    Usuario.findById(usuarioId).exec((error:Error, usuarioDB:Usuario) => {
      if(error) return res.status(500).json({ message : error });
      if(usuarioDB && !compareSync(datos.passwordActual, usuarioDB.password)) return res.status(400).json({ message : 'La contraseña actual es incorrecta' });

      const result = /^(?=\w*\d)(?=\w*)(?=\w*[a-z])\S{4,16}$/.test(datos.passwordNuevo);
      if(result){
        usuarioDB.password = hashSync(datos.passwordNuevo, 10);
        updateUser(res);
      } else {
        return res.status(400).json({ message : 'La contraseña es incorrecta, minimo debe tener 4 caracteres, un digito numerico y el texto en minuscula'});
      }

      async function updateUser(res:Response){
          await (usuarioDB as any).save();
          return res.status(200).json({ message : 'Contraseña actualizada correctamente' });
      };

    });
  };

  // metodo para generar y devolver un token
  export const generateToken = (req:Request, res:Response) => {

    const token = sign({ usuario : (req as any).usuario }, String(process.env.TOKEN), { expiresIn : '3h' });
    return res.status(200).json(token);
  };

  // retornar usuario por token
  export const retornarUsuarioToken = async (req:Request, res:Response) => {

    const token = (req as any).usuario;
    try {
      const user = await Usuario.findById(token);
      return res.status(200).json(user);
    } catch (e) {
        return res.status(500).json({ message : e });
    }
  };

  // funcion que se encargara de recibir datos y actualizar
  function actualizarUsuario(usuarioId:string, datosUsuario:any, res:Response){
    Usuario.findByIdAndUpdate(usuarioId, datosUsuario, {new:true, runValidators:true, context:'query'})
           .exec((error:Error, usuarioDB:Usuario) => {
             if(error) return res.status(500).json({ message : error.message });

             return res.status(200).json({ usuario : usuarioDB });
           });
  }

  // eliminar archivo del FS que no corresponda a una imagen valida
  function eliminarArchivo(archivo : string){
    unlinkSync(archivo);
  };

  // funcion para eliminar una imagen de perfil de usuario
  function elimarImagenUsuario(nameImagen : string) {
      const rutaImg = resolve(__dirname, `../uploads/perfil/${nameImagen}`);
      if(existsSync(rutaImg)){
        unlinkSync(rutaImg)
      }
  };
