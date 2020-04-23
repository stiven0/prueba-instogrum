
  import { model, Schema, Document } from 'mongoose';
  import uniqueValidator from 'mongoose-unique-validator';

  interface Usuario extends Document {
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

  const ROLES_VALIDOS = {
    values : ['ADMIN_ROLE', 'USER_ROLE'],
    message : '{VALUES} no es un rol valido'
  };

  const schemaUsuario : Schema = new Schema({

    nombre_completo : {
      type : String,
      trim : true,
      validate : {
        validator : (nombre_completo : string) => {
          return /[a-zA-ZÑñáéíóú]{2,30}$/.test(nombre_completo)
        },
        message : 'Error, el nombre no es correcto'
      },
      required : [true, 'El campo nombre es obligatorio']
    },

    nombre_usuario : {
      type : String,
      trim : true,
      lowercase : true,
      validate : {
        validator : (nombre_usuario : string) => {
          return /[a-z0-9-@ñáéíóú]+/.test(nombre_usuario)
        },
        message : 'Error, el nombre de usuario no tiene el formato correcto'
      },
      required : [true, 'El campo nombre de usuario es obligatorio']
    },

    correo : {
      type : String,
      trim : true,
      lowercase : true,
      unique : true,
      validate : {
        validator : (correo : string) => {
          return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(correo)
        },
        message : 'El correo ingresado no es correcto'
      },
      required : [true, 'El correo es obligatorio']
    },

    password : {
      type : String,
      required : [true, 'La contraseña es obligatoria']
    },

    imagen : {
      type : String,
      trim : true,
      required : false
    },

    descripcion : {
      type : String,
      maxlength : [100, 'No se permiten mas de 100 caracteres'],
      required : false
    },

    role : {
      type : String,
      enum : ROLES_VALIDOS,
      default : 'USER_ROLE',
    },

    seguidores : {
      type : Number,
      default : 0
    },

    seguidos : {
      type : Number,
      required : false
    },

    fecha_creacion : {
      type : String,
      required : true
    }
  });

  schemaUsuario.plugin(uniqueValidator, {message : 'Este {PATH} ya existe, debes eliger otro'});

  // metodo para no devolver la contraseña en las respuestas del servidor
  schemaUsuario.methods.toJSON = function(){
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }


  export default model<Usuario>('usuario', schemaUsuario);
