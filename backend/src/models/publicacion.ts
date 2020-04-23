
    import { model, Schema, Document } from 'mongoose';

    interface Publicacion extends Document {
      comentario : string;
      archivo_multimedia : string;
      tipoArchivo : string;
      me_gustas : number;
      usuariosMeGustas : string;
      etiquetas : string;
      usuarioPublicacion : string;
      comentarios : [{}];
      fecha_creacion : string;
    }

    const schemaPublicacion : Schema = new Schema({

      comentario : {
        type : String,
        trim : true,
        required : false
      },

      archivo_multimedia : {
        type : String,
        trim : true,
        required : false
      },

      tipoArchivo : {
        type : String,
        required : false
      },

      me_gustas : {
        type : Number,
        default : 0
      },

      usuariosMeGustas : [{
        type : Schema.Types.ObjectId, ref : 'usuario',
        required : false
      }],

      etiquetas : {
        type : String,
        required : false
      },

      usuarioPublicacion : {
        type : Schema.Types.ObjectId, ref : 'usuario',
        required : true
      },

      comentarios: {
        type : [{}],
        required : false
      },

      fecha_creacion : {
        type : String,
        required : true
      }

    }, { collection : 'publicaciones' });

    export default model<Publicacion>('publicacion', schemaPublicacion);
