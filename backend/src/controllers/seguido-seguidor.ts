
  import SeguidoSeguidor from '../models/seguido_seguidor';
  import {Request, Response} from 'express';
  import moment from 'moment';

  interface SeguidoSeguidorInteface {
    _id : string;
    usuario_seguido : string;
    usuario_seguidor : string;
    fecha_seguimiento : string;
  }

  // seguir a un usuario
  export const seguirUsuario = async (req:Request, res:Response) => {

      const seguido = req.params.seguido;

      if(seguido == (req as any).usuario){
          return res.status(400).json({ message : 'Error, accion no valida no es posible seguirte tu mismo' });
      }

      const datosSeguimiento = new SeguidoSeguidor({
        usuario_seguido : seguido,
        usuario_seguidor : (req as any).usuario,
        fecha_seguimiento : new Date().getTime()
      });

      try {
        const user = await datosSeguimiento.save();
        return res.status(201).json({ usuario : user, seguimiento : true });

      } catch(e) {
          return res.status(500).json({ message : e });
      }
  };

  // obtener seguimientos de un usuario
  export const obtenerUsuariosSeguidos = (req:Request, res:Response) => {

    const usuarioId = req.params.id;

    SeguidoSeguidor.find({ usuario_seguidor : usuarioId })
                   .populate('usuario_seguido')
                   .sort('-fecha_seguimiento')
                   .exec((error:Error, seguimientos:[SeguidoSeguidorInteface]) => {
                     if(error) return res.status(500).json({ message : error.message });
                     // if((seguimientos as any).length === 0) return res.status(400).json({ message : 'No sigues a ninguna persona por el momento' });

                     return res.status(200).json(seguimientos);
                   });
  };

  // obtener seguidores de un usuario
  export const obtenerSeguidores = (req:Request, res:Response) => {

    const usuarioId = req.params.id;

    SeguidoSeguidor.find({ usuario_seguido : usuarioId })
                   .populate('usuario_seguidor')
                   .sort('-fecha_seguimiento')
                   .exec((error:Error, seguidores:[SeguidoSeguidorInteface]) => {
                     if(error) return res.status(500).json({ message : error.message });
                     if((seguidores as any).length === 0) return res.status(400).json({ message : 'No tienes ningun seguidor por el momento' });

                     return res.status(200).json({seguidores});
                   });
  };

  // eliminar un seguimiento de usuario
  export const eliminarSeguimiento = (req:Request, res:Response) => {

    const seguimientoEliminar = req.params.id;

    SeguidoSeguidor.findOne({ usuario_seguido : seguimientoEliminar, usuario_seguidor : (req as any).usuario })
                   .exec((error:Error, seguimiento:SeguidoSeguidorInteface) => {
      if(error) return res.status(500).json({ message : error.message });
      if(!seguimiento) return res.status(400).json({ message : 'Error, la accion no se puede realizar correctamente' });
      if(seguimiento.usuario_seguidor != (req as any).usuario){
          return res.status(400).json({ message : 'No posees los permisos necesarios para realizar este accion' });
      }

      SeguidoSeguidor.findByIdAndDelete(seguimiento._id).exec((error:Error, seguimientoEliminado:SeguidoSeguidorInteface) => {
        if(error) return res.status(500).json({ message : error.message });

        return res.status(200).json({ seguimientoEliminado : true });
      });
    });
  };

  // metodo para retornar numero de seguidores o seguidos de un usuario
  export const contarSeguidoresOrSeguidor = (req:Request, res:Response) => {

    const usuarioId = req.params.id;
    const type = req.params.type;

    if(type === 'seguidores'){
      SeguidoSeguidor.countDocuments({ usuario_seguido : usuarioId }, (error:Error, conteo:Number) => {
        if(error) return res.status(500).json({ message : error.message });

        return res.status(200).json({ seguidores : conteo });
      });
    }else if(type === 'seguidos'){
      SeguidoSeguidor.countDocuments({ usuario_seguidor : usuarioId }, (error:Error, conteo:Number) => {
        if(error) return res.status(500).json({ message : error.message });

        return res.status(200).json({ seguidos : conteo });
      });
    } else {
        return res.status(400).json({ message :  'Error, el recurso solicitado no esta disponible'});
    }
  };
