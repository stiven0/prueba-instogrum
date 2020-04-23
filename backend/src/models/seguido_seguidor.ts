
  import { model, Schema, Document } from 'mongoose';

  interface SeguidoSeguidor extends Document {
    usuario_seguido : string;
    usuario_seguidor : string;
    fecha_seguimiento : string;
  }

  const schemaSeguidoSeguidor : Schema = new Schema({

    usuario_seguido : {
      type : Schema.Types.ObjectId, ref : 'usuario',
      required : true,
    },

    usuario_seguidor : {
      type : Schema.Types.ObjectId, ref : 'usuario',
      required : true,
    },

    fecha_seguimiento : {
      type : String,
      required : true
    }

  }, { collection : 'seguido_seguidores' });

  export default model<SeguidoSeguidor>('seguido_seguidor', schemaSeguidoSeguidor);
