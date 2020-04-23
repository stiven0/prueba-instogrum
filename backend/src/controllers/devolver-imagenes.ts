
  import { existsSync } from 'fs';
  import { resolve } from 'path';
  import {Request, Response} from 'express';

  // devolver imagen de perfil de un usuario
  export const devolverImgUsuario = (req:Request, res:Response) => {

    const image = req.params.image;

    let imgUsuarioPath = resolve(__dirname, `../uploads/perfil/${ image }`),
        noImagePath = resolve(__dirname, '../uploads/perfil/noimage.png');

    existsSync(imgUsuarioPath) ? res.sendFile(imgUsuarioPath) : res.sendFile(noImagePath);
  };

  // devolver imagen de una publicacion de un usuario
  export const devolverArchivoPublicacion = (req:Request, res:Response) => {

    const archivo = req.params.archivo;

    let archivoPublicacionPath = resolve(__dirname, `../uploads/publicacion/${ archivo }`),
        noArchivoPath = resolve(__dirname, '../uploads/perfil/noimage.png');

    existsSync(archivoPublicacionPath) ? res.sendFile(archivoPublicacionPath) : res.sendFile(noArchivoPath);
  };
