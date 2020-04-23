
  export class ComentarioModelo {

    constructor(
      public comentario : string, public usuarioComentario : {}, public archivo? : string,
      public _id? : string
    ){}
  }
