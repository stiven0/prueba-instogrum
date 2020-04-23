import { Component, OnInit } from '@angular/core';
import { PublicacionService } from '../../services/publicacion.service';
import { PublicacionModelo } from '../../models/publicacion';
import { environment } from '../../../environments/environment';

declare var $ : any;

@Component({
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.css']
})
export class PublicacionesComponent implements OnInit {
  public publicaciones : PublicacionModelo[];
  public url : string;
  public loadingPublicaciones : boolean;
  public loadingActual : boolean;
  private desdeInicio : number;

  constructor(private _publicacionService : PublicacionService) {
    this.url = environment.url;
    this.publicaciones = [];
    this.desdeInicio = 0;
    this.loadingPublicaciones = false;
    this.loadingActual = true;
  }

  ngOnInit(): void {
    this.getPublicaciones();
    this.detectarScrolling();
  }

  // obtener todas las publicaciones de mas reciente a menos reciente
  getPublicaciones(desde? : number, hasta? : number){
    this._publicacionService.getPublicacionesMasRecientes(desde, hasta).subscribe(
      (response:PublicacionModelo[]) => {
        
        this.loadingPublicaciones = false;
        if(response.length === 0){
            this.loadingActual = false;
            return;
        }
        this.publicaciones.push(...response);
      },
      error => {
        console.log(error);
      });
  };

  // metodo para detectar cuando el scroll llegue al final
  detectarScrolling(){
    $(window).scroll(() => {
      if($(window).scrollTop() + $(window).height() === $(document).height()){
          this.loadingPublicaciones = this.loadingActual;
          this.desdeInicio += 8;
          this.getPublicaciones(this.desdeInicio);
      }
    });
  };

}
