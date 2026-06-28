import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatToolbarModule }    from '@angular/material/toolbar';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSnackBarModule }   from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule }    from '@angular/material/tooltip';
import { MatBadgeModule }      from '@angular/material/badge';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent }     from './app.component';
import { JwtInterceptor }   from './core/interceptors/jwt.interceptor';

import { LoginComponent }       from './features/auth/components/login.component';
import { ChatComponent }        from './features/chat/components/chat.component';
import { MessageAreaComponent } from './features/chat/components/message-area.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, ChatComponent, MessageAreaComponent],
  imports: [
    BrowserModule, BrowserAnimationsModule, HttpClientModule,
    ReactiveFormsModule, FormsModule, CommonModule,
    MatToolbarModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatBadgeModule,
    AppRoutingModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
