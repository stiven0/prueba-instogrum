
  import { Injectable, EventEmitter } from '@angular/core';
  import { Router } from '@angular/router';
  import { HttpClient, HttpHeaders } from '@angular/common/http';
  import { environment } from '../../environments/environment';
  import { LoginModelo } from '../models/login';
  import { UsuarioModelo } from '../models/usuario';
  import { map } from 'rxjs/operators';

  @Injectable({
    providedIn : 'root'
  })

  export class UsuarioService {
    private url : string;
    public imagenUser : EventEmitter<string>;

    constructor(private _http:HttpClient, private router : Router){
      this.url = environment.url;
      this.imagenUser = new EventEmitter();
    }

    // metodo para retornar el token de usuario si lo hay
    retornarToken(){
      return localStorage.getItem('token') || '';
    };

    // metodo para descifar token y extraer el id del usuario logueado
    async descifrarToken(){
      let token : any = localStorage.getItem('token');
      token = JSON.parse(atob(token.split('.')[1]));
      return token.usuario;
    };

    // metodo para cerrar sesion de usuario
    cerrarSesionUser(){
      if(localStorage.getItem('token')){
          localStorage.removeItem('token');
          this.router.navigateByUrl('/login');
      }
    };

    // metodo para realizar la peticion de login al servidor
    login(datosUsuario : LoginModelo | any){
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this._http.post(this.url + 'login', datosUsuario, { headers })
                 .pipe(map( (response:{token:string}) => {
                   localStorage.setItem('token', response.token);
                   return true;
                 }));
    };

    // comprobar si un nombre de usuario esta disponible
    comprobarNombreUsuario(name : string){
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this._http.get(`${this.url}busqueda-nombre-usuario/${name}`, { headers });
    };

    // registrar un usuario en la base de datos
    registrarUsuario(usuario : UsuarioModelo){
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this._http.post(this.url + 'crear-usuario', usuario, {headers});
    };

    // devolver un usuario por busqueda
    buscarUsuario(name : string){
      let headers = new HttpHeaders().set('token', this.retornarToken())
                                     .set('Content-Type', 'application/json');
      return this._http.get(`${this.url}busqueda-usuario/${name}`, {headers})
                 .pipe(map( response => response['usuarios'] ));
    };

    // retornar informacion de usuario por su token
    getUsuarioToken(){
      let headers = new HttpHeaders().set('token', this.retornarToken())
                                    .set('Content-Type', 'application/json');
      return this._http.get(this.url + 'usuario-token', { headers });
    };

    // retornar usuario por nombre
    getUsuarioName(name : string){
      let headers = new HttpHeaders().set('token', this.retornarToken())
                                    .set('Content-Type', 'application/json');
      return this._http.get(`${this.url}usuario/${name}`, { headers });

    };

    // retornar usuario por nombre
    getUsuarioId(id : string){
      let headers = new HttpHeaders().set('token', this.retornarToken())
                                    .set('Content-Type', 'application/json');
      return this._http.get(`${this.url}usuario-id/${id}`, { headers });
    };

    // retornar usuarios recomendados
    getUsuariosRecomendados(desde? : number, hasta? : number){
      let headers = new HttpHeaders().set('token', this.retornarToken())
                                    .set('Content-Type', 'application/json');
      return this._http.get(this.url + `personas-mas-seguidas?desde=${desde}&hasta=${hasta}`, { headers })
                 .pipe(map(response => response['usuarios']));
    };

    // retornar usuarios paginados
    getUsuariosPaginados(desde? : number, hasta? : number){
      let headers = new HttpHeaders().set('token', this.retornarToken())
                                    .set('Content-Type', 'application/json');
      return this._http.get(`${this.url}usuarios?desde=${desde}&hasta=${hasta}`, {headers})
                 .pipe(map(response => response['usuarios']));
    };

    // metodo para aumentar el numero de seguidores de un usuario
    actualizarOquitarNumeroSeguidoresUsuario(id : string, type : string){
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this._http.post(`${this.url}agregar-quitar-numero-seguidores-usuario/${id}/${type}`, { headers });
    };

    // metodo para actualizar datos de un usuario logueado
    actualizarDatosUsuario(datos : {nombre_usuario?, nombre_completo?, imagen?, descripcion?}){
      let formData : FormData = new FormData();

      if(datos.nombre_usuario && datos.nombre_completo && datos.descripcion && datos.imagen){
        formData.append('nombre_usuario', datos.nombre_usuario);
        formData.append('nombre_completo', datos.nombre_completo);
        formData.append('imagen', datos.imagen);
        formData.append('descripcion', datos.descripcion);
      }

      if(datos.nombre_usuario && datos.nombre_completo && datos.descripcion && !datos.imagen){
        formData.append('nombre_usuario', datos.nombre_usuario);
        formData.append('nombre_completo', datos.nombre_completo);
        formData.append('descripcion', datos.descripcion);
      }

      if(datos.imagen && !datos.nombre_usuario && !datos.nombre_completo && !datos.descripcion){
        formData.append('imagen', datos.imagen);
      }

      let headers = new HttpHeaders().set('token', this.retornarToken());
      return this._http.put(`${this.url}actualizar-usuario`, formData, { headers })
                 .pipe(map(response => response['usuario']));
    };

    // metodo para actualizar datos de un usuario logueado 2
    actualizarDatosUsuario2(datos : {nombre_completo?, correo?, descripcion?}){
      let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                     .set('token', this.retornarToken());
      return this._http.put(`${this.url}actualizar-usuario`, datos, { headers })
                 .pipe(map(response => response['usuario']));
    };

    // metodo para actualizar la contraseña
    updatePassword(datos : { passwordActual : string, passwordNuevo : string }){
      let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                     .set('token', this.retornarToken());
      return this._http.put(`${this.url}/actualizar-password`, datos, { headers })
                 .pipe(map(response => response['message']));
    };

    // metodo para generar y obtener un nuevo token generado por el servidor
    generarToken(){
      let headers = new HttpHeaders().set('token', this.retornarToken())
                                     .set('Content-Type', 'application/json');
      return this._http.get(this.url + 'generar-token', { headers });
    };







  }
