
  import {Request, Response, NextFunction} from 'express';
  import Usuario from '../models/usuario';
  import atob from 'atob';

  const verificarRoleAdmin = (req:Request, res:Response, next:NextFunction) => {

    const token = req.header('token');

    if(token){
      const data = JSON.parse(atob(token.split('.')[1]));

      (async () => {
        try {
          const userDB : any = await Usuario.findById(data.usuario).select({ password : 0 });
          (userDB.role == 'ADMIN_ROLE') ? next()
          : res.status(400).json({ message : 'No tienes permisos para realizar esta opcion' });
        } catch(e) {
            res.status(400).json({ message : e });
        }
      })();

    } else {
        res.status(400).json({ message : 'No tienes permisos para realizar esta accion' });
    }

  }

  export default verificarRoleAdmin;
