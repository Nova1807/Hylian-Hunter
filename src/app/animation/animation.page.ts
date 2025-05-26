import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonicModule, AnimationController, IonContent, NavController } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-splash',
  imports: [IonicModule],
  template: `
    <ion-content #splashContent class="splash-screen" fullscreen>
      <video
        #splashVideo
        autoplay
        muted
        playsinline
        preload="auto"
        (ended)="startTransition()"
        class="splash-video">
        <source src="assets/animations/startup.mp4" type="video/mp4" />
      </video>
    </ion-content>
  `,
  styles: [`
    .splash-screen {
      --background: transparent;
      opacity: 1;
      z-index: 2;
    }
    .splash-video {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 2;
    }
  `]
})
export class AnimationPage implements AfterViewInit {
  @ViewChild('splashVideo') videoElementRef!: ElementRef<HTMLVideoElement>;
  @ViewChild(IonContent, { read: ElementRef }) splashContent!: ElementRef;

  constructor(
    private animationCtrl: AnimationController,
    private navCtrl: NavController
  ) {}

  ngAfterViewInit() {
    const video = this.videoElementRef.nativeElement;
    video.play().catch(() => {
      document.addEventListener('click', () => video.play(), { once: true });
    });
  }

  async startTransition() {
    const fadeOut = this.animationCtrl.create()
      .addElement(this.splashContent.nativeElement)
      .duration(800)
      .fromTo('opacity', '1', '0')
      .fromTo('z-index', '2', '1');

    const navigationPromise = this.navCtrl.navigateRoot('/tabs/tab3', {
      replaceUrl: true,
      animated: true,
      animation: (baseEl: any, opts: any) => {
        const enterAnimation = this.animationCtrl.create()
          .addElement(opts.enteringEl)
          .duration(800)
          .easing('ease-in')
          .fromTo('opacity', '0', '1')
          .fromTo('z-index', '1', '2');

        const leaveAnimation = this.animationCtrl.create()
          .addElement(opts.leavingEl)
          .duration(800)
          .fromTo('opacity', '1', '0')
          .fromTo('z-index', '2', '1');

        return this.animationCtrl.create()
          .addAnimation([enterAnimation, leaveAnimation]);
      }
    });

    await Promise.all([fadeOut.play(), navigationPromise]);
  }
}
