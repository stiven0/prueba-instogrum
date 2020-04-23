import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PublicacionService } from '../../services/publicacion.service';
import { SeguidorSeguidoService } from '../../services/seguido-seguidor.service';
import { UsuarioService } from '../../services/usuario.service';
import { environment } from '../../../environments/environment';
import { PublicacionModelo } from '../../models/publicacion';
import { UsuarioModelo } from '../../models/usuario';
import { ComentarioModelo } from '../../models/comentario';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

import { MatDialog } from '@angular/material/dialog';
import { ModalSeguidorSeguidoMegustaComponent } from '../../shared/modal-seguidor-seguido-megusta/modal-seguidor-seguido-megusta.component';

@Component({
  selector: 'app-publicacion',
  templateUrl: './publicacion.component.html',
  styleUrls: ['./publicacion.component.css']
})
export class PublicacionComponent implements OnInit {
  public url : string;
  public publicacion : any;
  public userEqual : boolean = false;
  public userSeguidos : UsuarioModelo[];
  public hasta : number;
  public desde : number;
  public comentariosPublicacion : any[];
  private idPublicacion : string;
  private userLogueado : UsuarioModelo;

  constructor(private _publicacionService : PublicacionService, private _seguidorSeguidoService : SeguidorSeguidoService,
              private _usuarioService : UsuarioService, private activated : ActivatedRoute, private router : Router,
              public snackBar : MatSnackBar, public dialog: MatDialog)  {

    this.url = environment.url;
    this.desde = 0;
    this.hasta = 6;
  }

  ngOnInit(): void {

    // recibimos y comprobamos el parametro que llega por la url
    this.activated.params.subscribe((parametro:Params) => {
      if(parametro.id && parametro.id.length === 24) {
        this.idPublicacion = parametro.id
        this.publicacionID(parametro.id);
      }
      else this.router.navigateByUrl('/no-found');
    });
  }

  // metodo que abrira el modal para mirar las personas que le han dado me gusta a la publicacion
  modalMeGustas(){
    this.dialog.open(ModalSeguidorSeguidoMegustaComponent, {
      width : '400px',
      data : { type : 'MeGustas', usuarios : this.publicacion.usuariosMeGustas }
    });
  };

  // paginar comentarios hacia adelante
  avanzar(){
    this.desde += 6;
    this.hasta += 6;
    this.publicacionID(this.idPublicacion);
  }

  // paginar comentarios hacia atras
  retroceder(){
    this.desde -= 6;
    this.hasta -= 6;
    this.publicacionID(this.idPublicacion);
  }

  // obtener publicacion por su id
  publicacionID(id : string){
    this._publicacionService.getPublicacionId(id).subscribe(
      (response:PublicacionModelo) => {
        this.publicacion = response;
        this.comentariosPublicacion = this.publicacion.comentarios.slice(this.desde, this.hasta);

        // llamamos al metodo para retornar info de usuario logueado
        this.usuarioLogueado();
      },
      error => {
        console.log(error);
      });
  };

  // obtener usuarios seguidos del user logueado
  getSeguidosUsuario(userID : string){
    this._seguidorSeguidoService.getUsuariosSeguidos(userID).subscribe(
      (response:any) => {
        this.userSeguidos = response.map((usuario) => usuario.usuario_seguido._id)
      },
      error => {
        console.log(error);
      });
  };


  // obtener datos de usuario logueado
  usuarioLogueado(){
    this._usuarioService.getUsuarioToken().subscribe(
      (response:UsuarioModelo) => {
        this.userLogueado = response;
        if(this.publicacion.usuarioPublicacion['_id'] === response._id) this.userEqual = true;
        else this.getSeguidosUsuario(response._id);

      },
      error => {
        console.log(error);
      });
    };

    // metodo para seguir a un usuario
    seguirUsuario(usuarioId : string){
      const btnSeguir : any = document.getElementsByClassName('seguir');
      btnSeguir[0].innerHTML = `<i class="fas fa-circle-notch fa-spin icono_load"></i>`

      this._seguidorSeguidoService.seguirUser(usuarioId).subscribe(
        (response:{usuario:UsuarioModelo, seguimiento:boolean}) => {

          if(response.seguimiento){
             this.userSeguidos.unshift((usuarioId as any));
             this.snackBar.open(`Siguiendo a ${ name } correctamente!!`, '👻', { duration : 4000 });
             this.incrementarOdisminurNumerosSeguidoresUsuario(usuarioId, 'agregar');
          }
        },
        error => {
          console.log(error);
        });
    };

    // metodo para dejar de seguir a un usuario
    dejarSeguir(usuario : UsuarioModelo){
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

                // buscamos en el arreglo de userSeguidos y lo eliminamos del mismo
                 let index = this.userSeguidos.indexOf((usuario._id as any));
                 if(index > -1){
                    this.userSeguidos.splice(index, 1);
                    this.incrementarOdisminurNumerosSeguidoresUsuario(usuario._id, 'quitar');
                 }
              }
            },
            error => {
              console.log(error);
            });
        }
      });
    };

    // metodo para incrementar o en su defecto decrementar el numero de seguidores de un usuario
    incrementarOdisminurNumerosSeguidoresUsuario(id : string, type : string){
      this._usuarioService.actualizarOquitarNumeroSeguidoresUsuario(id, type).subscribe(
        response => { },
        error => console.log(error));
    };

    // metodo para redirigir al perfil de usuario que realizo la publicacion
    dirigirPerfilUsuario(name : string){
      if(name === this.userLogueado.nombre_usuario) this.router.navigateByUrl('/perfil');
      else this.router.navigate(['/perfil', name]);
    };

    // metodo que llamara al servicio para agregar un me gusta a una publicacion
    addMeGusta(idPublicacion : string){
      this._publicacionService.agregarMeGustaPublicacion(idPublicacion).subscribe(
        (response:any) => {
          if(response.me_gusta) {
              this.publicacion.me_gustas += 1;
              this.publicacionID(this.idPublicacion);
          }
          if(response.message == 'Ya le diste me gusta a esta publicacion, no es posible hacerlo de nuevo') return;
        },
        error => {
          console.log(error);
        });
    };

    // metodo para agregar un comentario en la publicacion
    async publicar(comentario : string, idPublicacion : string){
      if(comentario === '') return;

      const btnPublicar = document.getElementsByClassName('btn_publicar');
      btnPublicar[0].innerHTML = `<i class="fas fa-circle-notch fa-spin icono_load"></i>`;

      // creamos el comentario a guardar
      const comentarioPublicacion : ComentarioModelo = {
        comentario,
        usuarioComentario : this.userLogueado
      };

      // llamamos el servicio para agregar el comentario creado
      this._publicacionService.agregarComentarioPublicacion(comentarioPublicacion, idPublicacion).subscribe(
        response => {

          if(response){
              this.publicacion.comentarios.length += 1;
              const input : any = document.getElementsByClassName('input_comentario');
              input[0].value= '';

              btnPublicar[0].innerHTML = `<span class="span_publicar">Publicar</span>`;

              // lanzamos mensaje de verificacion que el comentario se ha guardado correctamente
               this.snackBar.open('Comentario agregado', '👻', { duration : 2500 });

               // si el array de comentarios tiene menos de 6 comentarios, lanzamos la info con la publicacion de nuevo
               if(this.publicacion.comentarios.length < 6) this.publicacionID(this.idPublicacion);
          }
        },
        error => {
          console.log(error);
          btnPublicar[0].innerHTML = `<span class="span_publicar">Publicar</span>`;
        });
    };


    // retornar usuario por id
    usuarioPorId(id : string){
      this._usuarioService.getUsuarioId(id).subscribe(
        (response:UsuarioModelo) => {
          console.log(response);
        },
        error => {
          console.log(error);
        });
      };

}
