
  import { model, Schema } from 'mongoose';

  const schemaMensaje : Schema = new Schema({

    usuario_envia_mensaje : {
      type : Schema.Types.ObjectId, ref : 'usuario',
      required : true
    },

    usuario_recibe_mensaje : {
      type : Schema.Types.ObjectId, ref : 'usuario',
      required : true
    },

    texto_mensaje : {
      type : String,
      required : true
    },

    archivo_multimedia : {
      type : String,
      trim : true,
      required : false
    },

    fecha_envio : {
      type : String,
      required : true
    }

  });

  export default model('mensaje', schemaMensaje);
