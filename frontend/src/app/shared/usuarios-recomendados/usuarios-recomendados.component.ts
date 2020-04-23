import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/export-service';
import { SeguidorSeguidoService } from '../../services/seguido-seguidor.service';
import { environment } from '../../../environments/environment';
import { UsuarioModelo } from '../../models/usuario';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ModalImagenComponent } from '../../shared/modal-imagen/modal-imagen.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios-recomendados',
  templateUrl: './usuarios-recomendados.component.html',
  styleUrls: ['./usuarios-recomendados.component.css']
})
export class UsuariosRecomendadosComponent implements OnInit {

  public url : string;
  public usuario : UsuarioModelo;
  public usuarios : [UsuarioModelo];
  public usuariosSeguidos : any;

  constructor(private _usuarioService : UsuarioService, private _seguidoSeguidorService : SeguidorSeguidoService,
              private snackBar : MatSnackBar, public dialog: MatDialog) {
    this.url = environment.url;
  }

  ngOnInit() {

    this.retornarInfoUsuario();
    
    // nos suscribimos al servicio que emitira cualquier cambio en la imagen del usuario logueado
    this._usuarioService.imagenUser.subscribe((imagen : string) => this.usuario.imagen = imagen);
  }

  // abrir dialog para subir una imagen de perfil
  subirImg(){
    this.dialog.open(ModalImagenComponent, {
      width: '600px',
      data : this.usuario
    });
  };

  // metodo para llamar al servicio y retornar informacion de usuario por token
  retornarInfoUsuario(){
    this._usuarioService.getUsuarioToken().subscribe(
      (response:UsuarioModelo) => {
        this.usuario = response;

        // llamamos el metodo para retornar seguimientos de un usuario
        this.retornarSeguimientosUsuario();
        this.retornarUsuariosRecomendados();
      },
      error => {
        console.log(error);
      });
  };

  // metodo para retornar usuarios seguidos por un usuario
  retornarSeguimientosUsuario(){
    this._seguidoSeguidorService.getUsuariosSeguidos(this.usuario._id).subscribe(
      async (response:[] | any) => {
        this.usuariosSeguidos = await response.map((usuario) => usuario.usuario_seguido._id);
      },
      error => {
        console.log(error);
      });
  };

  // metodo para llamar al servicio y retornar usuarios recomendados o en su defectos usuarios registrados
  retornarUsuariosRecomendados(){
    this._usuarioService.getUsuariosRecomendados().subscribe(
      async response => {
        if(this.usuario){
           this.usuarios = await response.filter((usuario:UsuarioModelo) => usuario._id != this.usuario._id);
        }
      },
      error => {
        console.log(error);
      });
  };

  // metodo para crear seguimiento de usuario
  seguirUsuario(id : string, name : string){
    const btnSeguir : any = document.getElementsByClassName('seguir');

    // barremos todos lo botones de seguir y agregamos el icono de load
    for(const btn in btnSeguir){
        if(btnSeguir[btn].previousElementSibling.innerText.split(' ')[0] == name){
            btnSeguir[btn].innerHTML = `<i class="fas fa-circle-notch fa-spin icono_load"></i>`;
            break;
        }
    }

    this._seguidoSeguidorService.seguirUser(id).subscribe(
      (response:{usuario:UsuarioModelo, seguimiento:boolean}) => {

        if(response.seguimiento){
           this.retornarSeguimientosUsuario();
           this.snackBar.open(`Siguiendo a ${ name } correctamente!!`, '👻', { duration : 4000 });
           this.incrementarOdisminurNumerosSeguidoresUsuario(id, 'agregar');
        }
      },
      error => {
        console.log(error);
      });
  };

  // metodo para dejar de seguir a un usuario
  dejarDeSeguir(usuario : UsuarioModelo){
    this.snackBar.dismiss();
    Swal.fire({
      title : 'Deseas dejar se seguir a ' + usuario.nombre_usuario,
      imageUrl : `${this.url}devolver-img-usuario/${usuario.imagen}`,
      imageWidth : 200,
      confirmButtonText : 'Dejar de seguir',
      cancelButtonText : 'Cancelar',
      showCancelButton : true
    })
    .then((result) => {
      if(result.value){
        this._seguidoSeguidorService.eliminarSeguimientoUser(usuario._id).subscribe(
          response => {
            if(response) {
               this.retornarSeguimientosUsuario();
               this.incrementarOdisminurNumerosSeguidoresUsuario(usuario._id, 'quitar');
            }
          },
          error => {
            console.log(error);
          });
      }
    });
  };

  // llamamos al servicio que permitira incrementar o disminuir el numero de seguidores de un usuario
  incrementarOdisminurNumerosSeguidoresUsuario(idUsuario : string, type : string){
    this._usuarioService.actualizarOquitarNumeroSeguidoresUsuario(idUsuario, type).subscribe(
      response => {},
      error => console.log(error));
  };

}
