import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-splash',
  imports: [CommonModule, IonicModule],
  template: `
    <ion-content class="splash-screen" fullscreen>
      <video
        #splashVideo
        autoplay
        muted
        playsinline
        preload="auto"
        (ended)="navigateToHome()"
        class="splash-video">
        <source src="assets/animations/startup.mp4" type="video/mp4" />
      </video>
    </ion-content>
  `,
  styles: [`
    .splash-screen {
      --background: transparent;
      padding: 0;
      margin: 0;
    }
    .splash-video {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      top: 0;
      left: 0;
    }
  `]
})
export class AnimationPage implements AfterViewInit {
  @ViewChild('splashVideo') videoElementRef!: ElementRef<HTMLVideoElement>;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    const video = this.videoElementRef.nativeElement;
    // Attempt to play programmatically
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Error attempting to play video:', error);
        // Fallback: Auto-play after a user gesture
        document.addEventListener('click', () => video.play(), { once: true });
      });
    }
  }

  navigateToHome() {
    this.router.navigateByUrl('/tabs/tab3', { replaceUrl: true });
  }
}
