import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// pipes
import { PipeTimeAgo } from './timeago.pipe';

@NgModule({

  declarations : [
    PipeTimeAgo
  ],
  imports : [
    CommonModule
  ],
  exports : [
    PipeTimeAgo
  ]
})

export class PipesModule {}
