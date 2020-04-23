import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PublicacionService } from '../../services/publicacion.service';
import { SeguidorSeguidoService } from '../../services/seguido-seguidor.service';
import { UsuarioService } from '../../services/usuario.service';
import { ComentarioModelo } from '../../models/comentario';
import { UsuarioModelo } from '../../models/usuario';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
declare var $ : any;

import { MatDialog } from '@angular/material/dialog';
import { ModalSeguidorSeguidoMegustaComponent } from '../../shared/modal-seguidor-seguido-megusta/modal-seguidor-seguido-megusta.component';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  public publicaciones : [];
  public url : string;
  public loadingPublicaciones : boolean;
  public loadingActual : boolean;
  public userBD  : UsuarioModelo;
  private desdeInicio : number;

  constructor(private _publicacionService : PublicacionService, private _seguidoSeguidor : SeguidorSeguidoService,
              private _usuarioService : UsuarioService, private router : Router, public dialog : MatDialog) {
    this.publicaciones = [];
    this.url = environment.url;
    this.desdeInicio = 0;
    this.loadingPublicaciones = false;
    this.loadingActual = true;
  }

  ngOnInit(): void {
    this.getUsuario();

    // llamamos el metodo que nos dara info de usuario
    this.retornarInfoSeguimientosUsuario();

    sessionStorage.setItem('prueba', 'soy un texto de prueba');
  }

  // metodo para descifar token y extraer el id del usuario logueado
  private async descifrarToken(){
    let token : any = localStorage.getItem('token');
    token = JSON.parse(atob(token.split('.')[1]));
    return token.usuario;
  }

  // retornar info de usuario
  getUsuario(){
    this._usuarioService.getUsuarioToken().subscribe(
      (response:UsuarioModelo) => this.userBD = response,
      error => {
        console.log(error);
      });
  };

  // metodo para redireccionar a usuario
  dirigirUsuario(name : string){
    if(name === this.userBD.nombre_usuario) this.router.navigateByUrl('/perfil');
    else this.router.navigate(['/perfil', name]);
  };

  // llamamos al servicio para retornar informacion de los seguimientos del usuario
  async retornarInfoSeguimientosUsuario(){
    const idUsuario = await this.descifrarToken();
    this._seguidoSeguidor.getUsuariosSeguidos(idUsuario).subscribe(
      (response:[]) => {
        if(response.length > 0){
            this.obtenerPublicacionesUsuariosSeguidos();
            this.detectarScrolling(true);
        } else {
            this.detectarScrolling(false);
            this.obtenerPublicacionesMasRecientes();
        }
      },
      error => {
        console.log(error);
      });
  };

  // metodo para subir o agregar un comentario a una publicacion
  async publicar(comentario : string, idPublicacion : string, index : number){
    if(comentario === '') return;

    const btnPublicar = document.getElementsByClassName('btn_publicar');
    btnPublicar[index].innerHTML = `<i class="fas fa-circle-notch fa-spin icono_load"></i>`


    // creamos el comentario a guardar
    const comentarioPublicacion : ComentarioModelo = {
      comentario,
      usuarioComentario : this.userBD
    };

    // llamamos el servicio para agregar el comentario creado
    this._publicacionService.agregarComentarioPublicacion(comentarioPublicacion, idPublicacion).subscribe(
      response => {

        if(response){
            (this.publicaciones[index] as any).comentarios.length += 1;
            const input : any = document.getElementsByClassName('input_comentario');
            input[index].value= '';

            btnPublicar[index].innerHTML = `<span class="span_publicar">Publicar</span>`;

            // lanzamos mensaje de verificacion que el comentario se ha guardado correctamente
            Swal.fire({
              text : 'Tu comentario se ha publicado correctamente',
              icon : 'success',
              confirmButtonText : 'Ver comentario'
            })
            .then(result => {
              if(result.value) this.router.navigate(['/publicacion', idPublicacion]);
            });

        }
      },
      error => {
        console.log(error);
        btnPublicar[index].innerHTML = `<span class="span_publicar">Publicar</span>`;
      });
  };

  // si el usuario sigue a alguien
  obtenerPublicacionesUsuariosSeguidos(desde? : number, scrolling : boolean = false){
    this._publicacionService.getPublicacionesUsuariosSeguidos(desde).subscribe(
      (response:[]) => {
        this.loadingPublicaciones = false;

        /* si el o los usuarios a los que seguimos no tienen publicaciones y scrolling es false
         llamamos al metodo obtenerPublicacionesMasRecientes */
        if(!response && !scrolling){
            this.obtenerPublicacionesMasRecientes(desde);
            return;
        }

        // si no hay mas publicaciones y se esta haciendo scrolling hacemos el return
        if(!response && scrolling){
            this.loadingActual = false;
            return;
        }

        this.publicaciones.push(...response);
      },
      error => {
        console.log(error);
        this.loadingPublicaciones = false;
      });
  };

  // obtener publicaciones mas recientes - se mostrara si el usuario no sigue a nadie
  obtenerPublicacionesMasRecientes(desde? : number){
    this._publicacionService.getPublicacionesMasRecientes(desde).subscribe(
      (response:[]) => {

        this.loadingPublicaciones = false;
        if(response.length === 0){
          this.loadingActual = false;
          return;
        }
        this.publicaciones.push(...response);
      },
      error => {
        console.log(error);
        this.loadingPublicaciones = false;
      });
  };

  // metodo que llamara al servicio para agregar un me gusta a una publicacion
  addMeGusta(idPublicacion : string, index : number){
    this._publicacionService.agregarMeGustaPublicacion(idPublicacion).subscribe(
      (response:any) => {
        if(response.me_gusta)(this.publicaciones[index] as any).me_gustas += 1;
        if(response.message == 'Ya le diste me gusta a esta publicacion, no es posible hacerlo de nuevo') return;
      },
      error => {
        console.log(error);
      });
  };

  // metodo para detectar cuando el scroll llegue al final
  detectarScrolling(seguimiento : boolean){
    $(window).scroll(() => {

      if($(window).scrollTop() + $(window).height() === $(document).height() && this.router.url === '/principal'){

          this.loadingPublicaciones = this.loadingActual;
          this.desdeInicio += 8;

          (seguimiento)
          ? this.obtenerPublicacionesUsuariosSeguidos(this.desdeInicio, true)
          : this.obtenerPublicacionesMasRecientes(this.desdeInicio);
      }
    });
  };




}
