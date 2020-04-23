
  require('dotenv').config();
  import Publicacion from '../models/publicacion';
  import SeguidoSeguidor from '../models/seguido_seguidor';
  import { unlinkSync, existsSync } from 'fs';
  import { resolve } from 'path';
  import { Request, Response } from 'express';
  import { pick } from 'underscore';
  import moment from 'moment';
  import {v4 as uuidv4} from 'uuid';

  interface PublicacionInter {
    comentario : string;
    archivo_multimedia : string;
    tipoArchivo : string;
    me_gustas : number;
    usuariosMeGustas : [string];
    etiquetas : string;
    usuarioPublicacion : string;
    comentarios : [{}];
    fecha_creacion : string;
  }

  // metodo para subir una publicacion al servidor
  export const crearPublicacion = (req:Request, res:Response) => {

    const usuario = (req as any).usuario;

    // si llega un archivo multimedia
    if(req.file){

      const rutaArchivo = req.file.path;
      const extArchivo = req.file.originalname.split('.')[1];

      const EXT_VALIDAS : Array<string> = ['jpg', 'png', 'jpeg', 'gif', 'JPG', 'PNG', 'JPEG', 'GIF', 'mp4', 'MP4'];

      if(!EXT_VALIDAS.includes(extArchivo)){
          // borramos el archivo del FS
          borrarArchivoFS(rutaArchivo);
          return res.status(400).json({ message : 'El archivo subido no tiene un formato de imagen o video valido, prueba con otro' });
      }

      if(extArchivo === 'MP4' || extArchivo === 'mp4'){
         if(req.file.size <= 15000000 ){

            // se sube el video
            const datosPublicacion = new Publicacion({
              comentario : req.body.comentario,
              archivo_multimedia : req.file.filename,
              tipoArchivo : 'video',
              etiquetas : req.body.etiquetas,
              usuarioPublicacion : usuario,
              fecha_creacion : new Date().getTime()
            });
            // subir publicacion con video
            uploadPublicacion(res, datosPublicacion);

         } else {
           borrarArchivoFS(rutaArchivo);
           return res.status(400).json({ message : 'El video no debe superar los 15MB' });
         }

      } else {

        // subimos publicacion con imagen
        const datosPublicacion = new Publicacion({
          comentario : req.body.comentario,
          archivo_multimedia : req.file.filename,
          tipoArchivo : 'imagen',
          etiquetas : req.body.etiquetas,
          usuarioPublicacion : usuario,
          fecha_creacion : new Date().getTime()
        });
        uploadPublicacion(res, datosPublicacion);
      }

    } else {

        // subir publicacion sin archivo_multimedia
        const datosPublicacion = new Publicacion({
          comentario : req.body.comentario,
          etiquetas : req.body.etiquetas,
          usuarioPublicacion : usuario,
          fecha_creacion : new Date().getTime()
        });
        uploadPublicacion(res, datosPublicacion);
    }

  };

  // metodo para retornar las publicaciones mas gustadas
  export const publicacionesMasGustadas = (req:Request, res:Response) => {

    const desde = +req.query.desde || 0;
    const hasta = +req.query.hasta || 10;

    Publicacion.find({ me_gustas : {"$gt" : 0} })
               .skip(desde)
               .limit(hasta)
               .sort({ me_gustas : -1 })
               .populate('usuarioPublicacion', 'nombre_usuario imagen')
               .populate('usuariosMeGustas')
               .exec((error:Error, publicaciones:[PublicacionInter]) => {
                 if(error) return res.status(500).json({ message : error });

                 return res.status(200).json({ publicaciones : publicaciones });
               });
  };

  // metodo para retornar publicaciones paginadas y en orden de publicacion (de reciente a menos reciente)
  export const publicacionesPaginadas = (req:Request, res:Response) => {

    const desde = +req.query.desde || 0;
    const hasta = +req.query.hasta || 12;

    Publicacion.find()
               .skip(desde)
               .limit(hasta)
               .populate('usuarioPublicacion', 'nombre_usuario imagen')
               .populate('usuariosMeGustas')
               .sort('-fecha_creacion')
               .exec((error:Error, publicacionesDB:[PublicacionInter]) => {
                 if(error) return res.status(500).json({ message : error });

                 return res.status(200).json({ publicaciones : publicacionesDB});
               });

  };

  // devolver publicaciones por usuario
  export const publicacionesDeUsuario = (req:Request, res:Response) => {

    const desde = +req.query.desde || 0;
    const hasta = +req.query.hasta || 12;


    Publicacion.find({ usuarioPublicacion : (req as any).usuario })
                .skip(desde)
                .limit(hasta)
                .populate('usuarioPublicacion')
                .populate('usuariosMeGustas')
                .sort('-fecha_creacion')
                .exec((error:Error, publicacionesDB:PublicacionInter) => {
                    if(error) return res.status(500).json({ message : error });

                    Publicacion.countDocuments({ usuarioPublicacion : (req as any).usuario }, (error:Error, conteo:Number) => {
                      return res.status(200).json({ publicaciones : publicacionesDB, total : conteo });
                    });
                  });
  };

  // devolver publicaciones por id de usuario
  export const publicacionesDeUsuarioPorId = (req:Request, res:Response) => {

    const idUsuario = req.params.id;
    const desde = +req.query.desde || 0;
    const hasta = +req.query.hasta || 12;


    Publicacion.find({ usuarioPublicacion : idUsuario })
                .skip(desde)
                .limit(hasta)
                .populate('usuarioPublicacion')
                .populate('usuariosMeGustas')
                .sort('-fecha_creacion')
                .exec((error:Error, publicacionesDB:PublicacionInter) => {
                    if(error) return res.status(500).json({ message : error });

                    Publicacion.countDocuments({ usuarioPublicacion : idUsuario }, (error:Error, conteo:Number) => {
                      return res.status(200).json({ publicaciones : publicacionesDB, total : conteo });
                    });
                  });
  };

  // borrar publicacion por id
  export const borrarPublicacion = async (req:Request, res:Response) => {

    const publicacionId = req.params.id;

    try {
      const publicacion = await Publicacion.findById(publicacionId);
      if((publicacion as any).usuarioPublicacion == (req as any).usuario){

        Publicacion.findByIdAndDelete(publicacionId).exec((error:Error, publicacionDelete:PublicacionInter) => {
          if(error) return res.status(500).json({ message : error });
          if(!publicacionDelete) return res.status(400).json({ message : 'Ha ocurrido un error, el archivo al que intentas acceder no esta disponible' });

          borrarArchivoPublicacion(publicacionDelete.archivo_multimedia);
          return res.status(200).json({ message : 'La publicacion se ha eliminado correctamente' });
        });

      } else {
          return res.status(400).json({ message : 'No posees los permisos necesarios para realizar este accion' });
      }

    } catch(e) {
        return res.status(500).json({  message : e });
    }
  };

  // retornar publicaciones recientes de los usuarios que seguimos
  export const publicacionesUsuariosSeguidos = (req:Request, res:Response) => {

    const desde = +req.query.desde || 0;
    const hasta = +req.query.hasta || 12;

    SeguidoSeguidor.find({ usuario_seguidor : (req as any).usuario }, (error, seguimientosDB:any) => {
      if(error) return res.status(500).json({ message : error });
      if(seguimientosDB.length === 0) return res.status(200).json({ publicacionesDB : false });


      let idUsuariosSeguidos = [];
      for(const segumiento of seguimientosDB) {
          idUsuariosSeguidos.push(segumiento.usuario_seguido);
          if( idUsuariosSeguidos.length == seguimientosDB.length ){

                Publicacion.find({ usuarioPublicacion : {"$in" : idUsuariosSeguidos} })
                           .skip(desde)
                           .limit(hasta)
                           .populate('usuarioPublicacion')
                           .populate('usuariosMeGustas')
                           .sort('-fecha_creacion')
                           .exec((error:Error, publicacionesDB:[PublicacionInter]) => {
                             if(error) return res.status(500).json({ message : error });
                             if((publicacionesDB as any).length === 0) return res.status(200).json({ publicacionesDB : false });

                             return res.status(200).json({publicacionesDB});
                           });

          } else {
             continue;
          }
      };

    });
  };

  // obtener publicacion con base en un id
  export const obterPublicacionPorId = async (req:Request, res:Response) => {
    const publicacionId = req.params.id;

    try {
      const pubicacionDB = await Publicacion.findById(publicacionId)
                                            .populate('usuarioPublicacion')
                                            .populate('usuariosMeGustas');
      return res.status(200).json(pubicacionDB);

    } catch(e){
        return res.status(500).json({ message : e.message });
    }
  };

  // metodo para agregar un comentario a una publicacion
  export const agregarComentarioPublicacion = (req:Request, res:Response) => {

    const publicacionId = req.params.id;
    const datosComentario = pick(req.body, ['comentario', 'usuarioComentario', 'fecha_comentario', 'archivo', '_id']);
    datosComentario.fecha_comentario = String(new Date().getTime());

    datosComentario._id = uuidv4();

    // vino imagen
    if(req.file){

      const fileRuta = req.file.path;
      const extArchivo = req.file.originalname.split('.')[1];

      const EXT_VALIDAS : Array<string> = ['jpeg', 'jpg', 'gif', 'png', 'JPG', 'JPEG', 'GIF', 'PNG'];

      // eliminamos el archivo, ya que no corresponde a una imagen de formato valida
      if(!EXT_VALIDAS.includes(extArchivo)){
          borrarArchivoFS(fileRuta);
          return res.status(400).json({ message : 'El archivo subido no corresponde a un formato de imagen valido, por favor intenta de nuevo con otro archvo' });
      }
      datosComentario.archivo = req.file.filename;
      actualizarPublicacionComentarios(datosComentario);

    } else {
        // no vino imagen - enviamos datos sin imagen
        actualizarPublicacionComentarios(datosComentario);
    }

    // update comentarios de publicacion
    async function actualizarPublicacionComentarios(comentario:{}){

      Publicacion.findById(publicacionId).exec((error:Error, publicacionDB:PublicacionInter) => {
        if(error) return res.status(500).json({ message : error });
        if(!publicacionDB) return res.status(400).json({ message : 'Error, no fue posible realizar correctamente tu peticion, intenta de nuevo' });
        publicacionDB.comentarios.push(comentario);

        (publicacionDB as any).save((error:Error, publicacionActualizada:PublicacionInter) => {
          if(error) return res.status(500).json({ message : error });

          return res.status(200).json({ comentarioAgregado : true });
        });
     });
   };

  };

  // eliminar un comentario de una publicacion
  export const eliminarComentario = async (req:Request, res:Response) => {
    const publicacionId = req.params.publicacionId
    const comentarioId = req.params.comentarioId;

    Publicacion.findById(publicacionId).exec((error:Error, publicacionDB:PublicacionInter) => {
      if(error) return res.status(500).json({ message : error });

      if(publicacionDB && publicacionDB.comentarios.length > 0){

          for(const comentario in publicacionDB.comentarios){

                // si encontramos el comentario
                if((publicacionDB as any).comentarios[comentario]._id == comentarioId){

                  // si el comentario tiene un archvo de tipo file
                  if((publicacionDB as any).comentarios[comentario].archivo){
                      elimarImagenMensaje((publicacionDB as any).comentarios[comentario].archivo);
                      publicacionDB.comentarios.splice(Number(comentario), 1);
                      actualizarPubliComentario(publicacionDB);

                  } else {
                    publicacionDB.comentarios.splice(Number(comentario), 1);
                    actualizarPubliComentario(publicacionDB);
                  }
                    break;
                }
          }
      } else {
        return res.status(404).json({ message : 'Ha ocurrido un error, no es posible encontrar el recurso solicitado'});
      }

      // borrar comentario
      async function actualizarPubliComentario(publicacion:PublicacionInter) {
        try {
          await (publicacion as any).save();
          return res.status(200).json({ message : 'Se ha eliminado el comentario correctamente' });

        } catch(e) {
            return res.status(500).json({ message : e.message });
        }
      }

    });
  };

  // metodo para agregar un me gusta en una publicacion
  export const agregarMeGusta = (req:Request, res:Response) => {

    const publicacionId = req.params.id;
    const type = req.params.type;

    switch(type){

      case 'agregar':
        Publicacion.findById(publicacionId, (error:Error, publicacionDB:PublicacionInter) => {
          if(error) return res.status(500).json({ message : error });

          if(publicacionDB && publicacionDB.usuariosMeGustas.length >= 0) {
              const existeUsuario = publicacionDB.usuariosMeGustas.includes((req as any).usuario);
              existeUsuario
              ? res.status(200).json({ message : 'Ya le diste me gusta a esta publicacion, no es posible hacerlo de nuevo' })
              : (async () => {
                  publicacionDB.me_gustas += 1;
                  publicacionDB.usuariosMeGustas.push((req as any).usuario);
                  try {
                    await (publicacionDB as any).save();
                    return res.status(200).json({ me_gusta : true });
                  }catch(e) {
                     return res.status(500).json({ message : e });
                  }
              })();
          } else {
              return res.status(400).json({ message : 'No es posible realizar esta accion'});
          }
        });
      break;

      // case 'quitar' :
      //   Publicacion.findById(publicacionId, (error:Error, publicacionDB:PublicacionInter) => {
      //     if(error) return res.status(500).json({ message : error });
      //
      //     if(publicacionDB && publicacionDB.usuariosMeGustas.length > 0){
      //         const indexUsuario = publicacionDB.usuariosMeGustas.indexOf((req as any).usuario);
      //         if(indexUsuario > -1){
      //             publicacionDB.usuariosMeGustas.splice(indexUsuario, 1);
      //             publicacionDB.me_gustas -= 1;
      //         }
      //         publicacionDB.no_me_gustas += 1;
      //         (async () => {
      //           try {
      //             const response = await (publicacionDB as any).save();
      //             return res.status(200).json({ publicacion : response });
      //
      //           }catch(e) {
      //             return res.status(500).json({ message : e });
      //           }
      //         })();
      //     } else {
      //         return res.status(400).json({ message : 'No es posible realizar esta accion'});
      //     }
      //   });
      // break;

      default :
      return res.status(500).json({ message : 'Error, no es posible que realices esta accion' });
    }

  }


  // borrar archivo multimedia de la carpeta de publicacion
 function borrarArchivoPublicacion(archivo : string){
  const rutaArchivo = resolve(__dirname, `../uploads/publicacion/${ archivo }`);
  if(existsSync(rutaArchivo)){
    unlinkSync(rutaArchivo);
  }
}

// subir publicacion dependiendo de los datos que reciba
  async function uploadPublicacion(res:Response, datosPublicacion:any){
    try {
      const publicacion = await datosPublicacion.save();
      return res.status(201).json(publicacion);
    } catch (e){
        return res.status(500).json({ message : e });
    }
  }

  // borrar archivo del File system
  function borrarArchivoFS(rutaArchivo : string){
      unlinkSync(rutaArchivo);
  }

  // funcion para eliminar una imagen de un mensaje de usuario
  function elimarImagenMensaje(nameImagen : string) {
      const rutaImg = resolve(__dirname, `../uploads/mensaje/${nameImagen}`);
      if(existsSync(rutaImg)){
        unlinkSync(rutaImg)
      }
  };
