import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { SeguidorSeguidoService } from '../../services/seguido-seguidor.service';
import { PublicacionService } from '../../services/publicacion.service';
import { UsuarioModelo } from '../../models/usuario';
import { PublicacionModelo } from '../../models/publicacion';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { ModalImagenComponent } from '../../shared/modal-imagen/modal-imagen.component';
import { ModalPublicacionComponent } from '../../shared/modal-publicacion/modal-publicacion.component';
import { ModalSeguidorSeguidoMegustaComponent } from '../../shared/modal-seguidor-seguido-megusta/modal-seguidor-seguido-megusta.component';

import Swal from 'sweetalert2';
declare var $ : any;

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  public url : string;
  public usuario : UsuarioModelo;
  public seguidosUser : number;
  public publicaciones : PublicacionModelo[];
  public totalPublicaciones : number;
  public usuarioPublico : string;
  public usuariosSeguidosUsuario : any;
  private desde : number;

  constructor(private _usuarioService : UsuarioService, private _seguidorSeguidoService : SeguidorSeguidoService,
              private _publicacionService : PublicacionService, private activated : ActivatedRoute,
              private router : Router, private snackBar : MatSnackBar, public dialog: MatDialog) {

    this.url = environment.url;
    this.desde = 0;
  }

  ngOnInit(): void {

    // comprobamos si viene parametro por la url
    this.activated.params.subscribe(
      (parametro:Params) => {

          // si recibimos un usuario publico
          if(parametro.name)  {
              this._usuarioService.getUsuarioToken().subscribe(
                (user:UsuarioModelo) => {
                  user.nombre_usuario === parametro.name
                  ?
                  this.router.navigateByUrl('/**')
                  :
                  this.usuarioPublico = parametro.name;
                  this.getInfoUsuarioPublico(this.usuarioPublico);
                  this.seguimientosDeUsuario(user._id);
              });

          } else {
              // si recibimos el usuario logueado
              this.getInfoUsuario();
          }
      });

    this.detectarScrolling();

    // nos suscribimos al servicio que emitira cualquier cambio en la imagen del usuario logueado
    this._usuarioService.imagenUser.subscribe((imagen : string) => this.usuario.imagen = imagen);

    // nos suscribimos al servicio que emitira una publicacion cuando el usuario agregue una nueva
    this._publicacionService.newPublicacionUser.subscribe((publicacion : PublicacionModelo) => {
      this.totalPublicaciones += 1;
      this.publicaciones.unshift(publicacion);
    });

  }

  // metodo que llama al servicio para eliminar una publicacion
  borrarPublicacion(id : string, index : number){

    Swal.fire({
      title : 'Deseas eliminar esta publicacion',
      icon : 'question',
      confirmButtonText : 'Eliminar',
      cancelButtonText : 'Cancelar',
      showCancelButton : true
    })
    .then(result => {
      if(result.value){
          this._publicacionService.deletePublicacion(id).subscribe(
            response => {
              if(response === 'La publicacion se ha eliminado correctamente'){
                this.publicaciones.splice(index, 1);
              }
            },
            error => {
              console.log(error);
            });
      }
    });
  };

  // abrir dialog para subir una imagen de perfil
  subirImg(){
    if(this.usuarioPublico) return;

    this.dialog.open(ModalImagenComponent, {
      width: '600px',
      data : this.usuario
    });
  };

  // abrir dialog para subir una publicacion
  subirPublicacion(){
    this.dialog.open(ModalPublicacionComponent, {
      width : '700px',
      data : this.usuario
    });
  };

  // dialog de seguidores de usuario
  viewSeguidores(){
    if(this.usuario.seguidores === 0) return;
    this.dialog.open(ModalSeguidorSeguidoMegustaComponent, {
      width : '400px',
      data : { type : 'Seguidores', usuario : this.usuario._id }
    });
  };

  // dialog de seguidos de usuario
  viewSeguidos(){
    if(this.seguidosUser === 0) return;
    this.dialog.open(ModalSeguidorSeguidoMegustaComponent, {
      width : '400px',
      data : { type : 'Seguidos', usuario : this.usuario._id }
    });
  };

  // metodo para retornar los usuarios seguidos por el usuario logueado
  seguimientosDeUsuario(id : string){
    this._seguidorSeguidoService.getUsuariosSeguidos(id).subscribe(
      (response:[]) => {
        if(response.length > 0) this.usuariosSeguidosUsuario = response.map((usuario:any) => usuario.usuario_seguido._id);
      },
      error => {
        console.log(error);
      });
  };

  // obtener informacion del usuario logueado
  getInfoUsuario(){
    this._usuarioService.getUsuarioToken().subscribe(
      (user : UsuarioModelo) => {
        this.usuario = user;
        this.obtenerNumerosSeguidoresSeguidosUser(user._id, 'seguidos'); // llamamos el metodo para obtener numero seguidos

        this.obtenerPublicacionesUsuario(0, 12); // llamamos el metodo para obtener publicaciones
      },
      error => {
        console.log(error);
      });
  };

  // obtener informacion de usuario publico
  getInfoUsuarioPublico(usuario:string){
    this._usuarioService.getUsuarioName(usuario).subscribe(
      (user : UsuarioModelo) => {
        if(user === null) {
             this.router.navigateByUrl('/**');
             return;
        }
        this.usuario = user;

        this.obtenerNumerosSeguidoresSeguidosUser(user._id, 'seguidos'); // llamamos el metodo para obtener numero seguidos

        this.obtenerPublicacionesUsuarioPublico(user._id, 0, 12); // llamamos el metodo para obtener publicaciones de usuario por id
      },
      error => {
        console.log(error);
      });
  };

  // obtener publicaciones de usuario
  obtenerPublicacionesUsuario(desde : number, hasta : number, paginacion? : boolean){
    this._publicacionService.getPublicacionesUsuario(desde, hasta).subscribe(
      (publicaciones : {publicaciones : PublicacionModelo[], total : number}) => {

        if(paginacion) {
            this.publicaciones.push(...publicaciones.publicaciones);
            return;
        }
        this.publicaciones = publicaciones.publicaciones;
        this.totalPublicaciones = publicaciones.total;
      },
      error => {
        console.log(error);
      });
  };

  // obtener publicaciones de usuario por su id
  obtenerPublicacionesUsuarioPublico(usuarioId : string, desde : number, hasta : number, paginacion? : boolean){
    this._publicacionService.getPublicacionesUsuarioPorId(usuarioId, desde, hasta).subscribe(
      (publicaciones : {publicaciones : PublicacionModelo[], total : number}) => {

        if(paginacion) {
            this.publicaciones.push(...publicaciones.publicaciones);
            return;
        }
        this.publicaciones = publicaciones.publicaciones;
        this.totalPublicaciones = publicaciones.total;
      },
      error => {
        console.log(error);
      });
  };

  // obtener seguidores y seguidos de usuario
  obtenerNumerosSeguidoresSeguidosUser(idUsuario : string, type : string){
    this._seguidorSeguidoService.getNumeroSeguidosOrSguidoresUsuario(idUsuario,type).subscribe(
      (response:{seguidores? : number, seguidos? : number}) => {
        this.seguidosUser = response.seguidos;
      },
      error => {
        console.log(error);
      });
  };

  // metodo para crear seguimiento de usuario
  seguirUsuario(id : string, name : string){
    const btnSeguir : any = document.getElementsByClassName('seguir');

    btnSeguir[0].innerHTML = `<i class="fas fa-circle-notch fa-spin icono_load"></i>`;

    this._seguidorSeguidoService.seguirUser(id).subscribe(
      (response:{usuario:UsuarioModelo, seguimiento:boolean}) => {

        if(response.seguimiento){
           this.snackBar.open(`Siguiendo a ${ name } correctamente!!`, '👻', { duration : 4000 });
           this.incrementarOdisminurNumerosSeguidoresUsuario(id, 'agregar');

           if(this.usuariosSeguidosUsuario === undefined){
              this.usuariosSeguidosUsuario = []
              this.usuariosSeguidosUsuario.push(id);
           } else {
              this.usuariosSeguidosUsuario.push(id);
           }

           this.usuario.seguidores += 1;
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
        this._seguidorSeguidoService.eliminarSeguimientoUser(usuario._id).subscribe(
          response => {
            if(response) {
                this.incrementarOdisminurNumerosSeguidoresUsuario(usuario._id, 'quitar');
                let index = this.usuariosSeguidosUsuario.indexOf(usuario._id);
                if(index > -1) this.usuariosSeguidosUsuario.splice(index, 1);
                this.usuario.seguidores -= 1;
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
      response => { },
      error => console.log(error));
  };

  // metodo para detectar cuando el scroll llegue al final
  detectarScrolling(){
    $(window).scroll(() => {
      if($(window).scrollTop() + $(window).height() === $(document).height()){

          if(this.publicaciones && this.publicaciones.length === this.totalPublicaciones) return;

          // si la paginacion es del usuario publico
          if(this.usuarioPublico && this.publicaciones && this.publicaciones.length >= 12){
              this.desde += 12;
              this.obtenerPublicacionesUsuarioPublico(this.usuario._id, this.desde, 12, true);
          }

          // si la paginacion es del usuario logueado
          if(!this.usuarioPublico && this.publicaciones && this.publicaciones.length >= 12){
              this.desde += 12;
              this.obtenerPublicacionesUsuario(this.desde, 12, true);
          }
      }
    });
  };

  // logout de la app
  cerrarSesion(){
    this._usuarioService.cerrarSesionUser();
  };


}
