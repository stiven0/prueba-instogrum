
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsuarioService } from './export-service';
import { environment } from '../../environments/environment';
import { UsuarioModelo } from '../models/usuario';

@Injectable({
  providedIn : 'root'
})

export class SeguidorSeguidoService {
  private url : string;

  constructor(private _usuarioService : UsuarioService, private _http : HttpClient){
    this.url = environment.url;
  }

  retornarToken(){
    return localStorage.getItem('token') || '';
  };

  // obterner seguimientos de un usuario
  getUsuariosSeguidos(idUsuario : string){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(`${this.url}obtener-seguimientos-usuario/${idUsuario}`, { headers });
  };

  // obterner seguidores de un usuario
  getUsuariosSeguidores(idUsuario : string){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(`${this.url}obtener-seguidores-usuario/${idUsuario}`, { headers });
  };

  // metodo para seguir a usuario
  seguirUser(usuarioAseguir : string){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(`${this.url}crear-seguimiento/${usuarioAseguir}`, { headers });
  };

  // metodo para eliminar un seguimiento
  eliminarSeguimientoUser(usuarioId : string){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.delete(`${this.url}eliminar-seguimiento/${usuarioId}`, { headers });
  };

  // obtener numero de seguidores o seguidos de un usuario
  getNumeroSeguidosOrSguidoresUsuario(id : string, type : string){
    let headers = new HttpHeaders().set('token', this.retornarToken())
                                   .set('Content-Type', 'application/json');
    return this._http.get(`${this.url}/obtener-numero-seguidores-seguidos/${id}/${type}`, { headers });
  };



}
