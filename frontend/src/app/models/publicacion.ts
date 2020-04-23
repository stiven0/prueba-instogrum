
  export class PublicacionModelo {
    constructor(public _id : string, public comentario : string, public usuarioPublicacion : string,
                public fecha_creacion : string, public archivo_multimedia? : string,
                public me_gustas? : number, public comentarios? : [{}], public usuariosMeGustas? : [string]){}
  }
