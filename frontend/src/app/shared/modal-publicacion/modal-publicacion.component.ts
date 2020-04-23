import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UsuarioModelo } from '../../models/usuario';
import { PublicacionModelo } from '../../models/publicacion';
import { environment } from '../../../environments/environment';
import { UsuarioService } from '../../services/usuario.service';
import { PublicacionService } from '../../services/publicacion.service';

@Component({
  selector: 'app-modal-publicacion',
  templateUrl: './modal-publicacion.component.html',
  styleUrls: ['./modal-publicacion.component.css']
})
export class ModalPublicacionComponent implements OnInit {
  public usuario : UsuarioModelo;
  public url : string;
  public formularioPublicacion : { archivo : any, comentario : string };
  public fileArchivo : File;
  public errorVideoPesado : boolean;
  public errorArchivoNoEncontrado : boolean;

  constructor(public dialogRef: MatDialogRef<ModalPublicacionComponent>, private _usuarioService : UsuarioService,
              private _publicacionService : PublicacionService) {

    this.url = environment.url;
    this.usuario = this.dialogRef._containerInstance._config.data;
    this.formularioPublicacion = { archivo : '', comentario : '' };
    this.errorVideoPesado = false;
    this.errorArchivoNoEncontrado = false;
  }

  ngOnInit(): void {
  }

  // metodo submit del formulario que permitira publicar algo
  publicar(formulario : NgForm){

    if(this.fileArchivo && !this.errorVideoPesado && !this.errorArchivoNoEncontrado){
        formulario.value.archivo = this.fileArchivo;

        if(formulario.value.comentario !== '') this.uploadPublicacion(formulario.value);
        else this.uploadPublicacion({ archivo : this.fileArchivo });

    } else {
        this.errorVideoPesado = false;
        this.errorArchivoNoEncontrado = true;
        return;
    }
  };

  // metodo para determinar que tipo de archivo subio el usuario
  archivoPublicacion(archivo : File){

    if((archivo as any) === undefined) {
        this.errorArchivoNoEncontrado = true;
        return;
    }

    this.errorArchivoNoEncontrado = false;
    this.errorVideoPesado = false;
    const extValidas = ['png', 'jpeg', 'jpg', 'PNG', 'JPEG', 'JPG', 'mp4', 'MP4'];

    if(!extValidas.includes(archivo.type.split('/')[1])) return;

    // es una imagen
    if(archivo.type.split('/')[1] == 'png' || archivo.type.split('/')[1] == 'jpg' || archivo.type.split('/')[1] == 'jpeg' ||
      archivo.type.split('/')[1] == 'PNG' || archivo.type.split('/')[1] == 'JPG' || archivo.type.split('/')[1] == 'JPEG'){
        this.fileArchivo = archivo;
    }
    // es un video
    if( archivo.type.split('/')[1] == 'mp4' || archivo.type.split('/')[1] == 'MP4'){

        // si el video subido sobrepasa el tamaño requerido y aceptado por el servidor
        if(archivo.size > 15000000){
            this.errorVideoPesado = true;
            return;

        } else {
            this.fileArchivo = archivo;
        }
    }
  };

  // metodo que llamara al servicio para guardar una publicacion
  uploadPublicacion(publicacionDB : {comentario?, archivo?}){

    // icono de carga en el boton
    const btn : any = document.getElementsByClassName('btn_publicar');
    btn[0].value = '';
    btn[0].innerHTML = `<i class="fas fa-circle-notch fa-spin icono_load"></i>`;

    this._publicacionService.agregarPublicacion(publicacionDB).subscribe(
      (response:PublicacionModelo) => {
        this._publicacionService.newPublicacionUser.emit(response);
        this.dialogRef.close();
      },
      error => {
        btn[0].value = 'Publicar';
        btn[0].innerHTML = `Publicar`;

        console.log(error);
      });
  };

  // metodo para agregar un icono al comentario
  agregarIcono(icono : number){

    switch( icono ){

      case 1 :
        this.formularioPublicacion.comentario += '😆';
        break;

      case 2 :
        this.formularioPublicacion.comentario += '😂';
        break;

      case 3 :
        this.formularioPublicacion.comentario += '😎';
        break;

      case 4 :
        this.formularioPublicacion.comentario += '😘';
        break;

      case 5 :
        this.formularioPublicacion.comentario += '😡';
        break;

      case 6 :
        this.formularioPublicacion.comentario += '😭';
        break;

      case 7 :
        this.formularioPublicacion.comentario += '😇';
        break;

      case 8 :
        this.formularioPublicacion.comentario += '👏';
        break;

      case 9 :
        this.formularioPublicacion.comentario += '👍';
        break;

      case 10 :
        this.formularioPublicacion.comentario += '😜';
        break;

      case 11 :
        this.formularioPublicacion.comentario += '👿';
        break;

      case 12 :
        this.formularioPublicacion.comentario += '😷';
        break;

      case 13 :
        this.formularioPublicacion.comentario += '😒';
        break;

      case 14 :
        this.formularioPublicacion.comentario += '❤';
        break;

      case 15 :
        this.formularioPublicacion.comentario += '😉';
        break;

      case 16 :
        this.formularioPublicacion.comentario += '😅';
        break;

      case 17 :
        this.formularioPublicacion.comentario += '😁';
        break;

      case 18 :
        this.formularioPublicacion.comentario += '💩';
        break;

      case 19 :
        this.formularioPublicacion.comentario += '👊';
        break;

     case 20 :
        this.formularioPublicacion.comentario += '😱';
        break;

      default : console.log('Error opcion no valida');
    }
  };



}
