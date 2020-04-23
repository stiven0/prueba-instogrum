
  export class UsuarioModelo {
    constructor( public _id : string, public nombre_completo : string, public correo : string, public nombre_usuario : string,
                public contraseña : string, public imagen? : string, public descripcion? : string,
                public role? : string, public seguidores? : number, public seguidos? : number,
                public fecha_creacion? : string){}
  }
