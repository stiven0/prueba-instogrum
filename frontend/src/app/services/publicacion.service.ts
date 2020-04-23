
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ComentarioModelo } from '../models/comentario';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn : 'root'
})

export class PublicacionService {
  private url : string;
  public newPublicacionUser : EventEmitter<any>;

  constructor(private _http : HttpClient){
    this.url = environment.url;
    this.newPublicacionUser = new EventEmitter();
  }

  private retornarToken(){
    return localStorage.getItem('token') || '';
  }

  // obtener publicaciones de usuario logueado
  getPublicacionesUsuario(desde? : number, hasta? : number){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(`${this.url}publicaciones-usuario?desde=${desde}&hasta=${hasta}`, { headers });
  };

  // obtener publicaciones de usuario logueado
  getPublicacionesUsuarioPorId(usuario : string, desde? : number, hasta? : number){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(`${this.url}publicaciones-usuario/${usuario}?desde=${desde}&hasta=${hasta}`, { headers });
  };

  // obtener publicaciones de usuarios que seguimos
  getPublicacionesUsuariosSeguidos(desde? : number, hasta? : number){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(this.url + `publicaciones-usuarios-seguidos?desde=${ desde }&hasta=${ hasta }`, { headers })
               .pipe(map(response => response['publicacionesDB']));
  };

  // obtener publicaciones mas gustadas
  getPublicacionesMasGustadas(desde? : number, hasta? : number){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(this.url + `obtener-publicaciones-mas-gustadas?desde=${desde}&hasta=${hasta}`, { headers });
  };

  // obtener publicaciones mas recientes
  getPublicacionesMasRecientes(desde? : number, hasta? : number){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(this.url + `obtener-publicaciones-paginadas?desde=${desde}&hasta=${hasta}`, { headers })
               .pipe(map(response => response['publicaciones']));
  };

  // agregar me gusta a una publicacion
  agregarMeGustaPublicacion(publicacionId : string){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(`${this.url}agregar-me-gusta/${publicacionId}/agregar`, {headers});
  };

  // agregar o comentar una publicacion
  agregarComentarioPublicacion(comentario : ComentarioModelo, idPublicacion : string){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.put(`${this.url}/agregar-comentario/${idPublicacion}`, {comentario}, {headers})
               .pipe(map(response => response['comentarioAgregado']));
  };

  // metodo para subir una publicacion a la base de datos
  agregarPublicacion(publicacion : { comentario?, archivo? }){
    let formData : FormData = new FormData();

    if(publicacion.comentario && publicacion.archivo){
        formData.append('comentario', publicacion.comentario);
        formData.append('archivo', publicacion.archivo);
    }
    if(publicacion.archivo && !publicacion.comentario){
        formData.append('archivo', publicacion.archivo);
    }

    let headers = new HttpHeaders().set('token', this.retornarToken());
    return this._http.post(this.url + 'subir-publicacion', formData, {headers})
  };

  // borrar publicacion por id
  deletePublicacion(idPublicacion : string){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.delete(`${this.url}borrar-publicacion/${idPublicacion}`, { headers })
               .pipe(map(response => response['message']));
  };

  // obtener publicacion por id
  getPublicacionId(id : string){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(`${this.url}publicacion-id/${id}`, { headers });
  };



}
