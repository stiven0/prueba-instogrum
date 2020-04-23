import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UsuarioModelo } from '../../models/usuario';
import { environment } from '../../../environments/environment';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-modal-imagen',
  templateUrl: './modal-imagen.component.html',
  styleUrls: ['./modal-imagen.component.css']
})
export class ModalImagenComponent implements OnInit {
  public usuario : UsuarioModelo;
  public url : string;
  public imgTemporal : any;
  public imagen : File;

  constructor(public dialogRef: MatDialogRef<ModalImagenComponent>, private _usuarioService : UsuarioService) {
    this.url = environment.url;
    this.usuario = this.dialogRef._containerInstance._config.data;
  }

  ngOnInit(): void {
  }

  // recibimos informacion de la imagen subida por el usuario
  verImg(imagen : File){
    const extValidas = ['png', 'jpeg', 'jpg', 'PNG', 'JPEG', 'JPG'];

    if(!extValidas.includes(imagen.type.split('/')[1])) return; // comprobamos que el archivo subido sea una imagen
    this.imagen = imagen;

    // creamos una imagen con base 64
    let reader = new FileReader();
    let urlTemporal = reader.readAsDataURL(imagen);
    reader.onloadend = () => this.imgTemporal = reader.result;
  };

  // metodo para subir una imagen de perfil de usuario
  uploadImgProfile(){
    if(!this.imagen) return;
    const btn_actualizar : any = document.getElementsByClassName('btn_update');

    // icono de carga de imagen
    btn_actualizar[0].value = '';
    btn_actualizar[0].innerHTML = `<i class="fas fa-circle-notch fa-spin icono_load"></i>`;

    const datos = {imagen : this.imagen};
    this._usuarioService.actualizarDatosUsuario(datos).subscribe(
      (response:UsuarioModelo) => {

        this._usuarioService.imagenUser.emit(response.imagen); // emitimos imagen actualizada del usuario
        this.dialogRef.close(); // cerramos el dialog
      },
      error => {
        console.log(error);
      });
  };


}
