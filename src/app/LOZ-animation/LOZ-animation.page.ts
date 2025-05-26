import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AnimationController, NavController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-LOZ-animation',
  template: `
    <video
      #animationPlayer
      (ended)="onAnimationEnd()"
      [src]="currentAnimation"
      autoplay
      muted
      playsinline
      style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; object-fit: cover; z-index: 1000;">
    </video>
  `,
  standalone: true
})
export class LOZAnimationPage implements AfterViewInit {
  @ViewChild('animationPlayer') videoRef!: ElementRef<HTMLVideoElement>;
  currentAnimation = '';
  private readonly playedFlagKey = 'lozAnimationPlayed';

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private animationCtrl: AnimationController
  ) {
    // Statt localStorage jetzt sessionStorage verwenden:
    if (sessionStorage.getItem(this.playedFlagKey) === 'true') {
      this.navCtrl.navigateRoot('/tabs/LOZ', { animated: false });
      return;
    }

    // Flag für diese Session setzen
    sessionStorage.setItem(this.playedFlagKey, 'true');

    // Wie gehabt: Animation-Quelle basierend auf Origin auswählen
    const nav = this.router.getCurrentNavigation();
    const origin = nav?.extras?.state?.['origin'];

    if (origin === 'Monster-Hunter') {
      this.currentAnimation = 'assets/animations/Monster-Hunter-LOZ.mp4';
    } else if (origin === 'tab3') {
      this.currentAnimation = 'assets/animations/Home-LOZ.mp4';
    } else {
      this.navCtrl.navigateRoot('/tabs/LOZ', { animated: false });
    }
  }

  async ngAfterViewInit() {
    try {
      const video = this.videoRef.nativeElement;
      await video.play();
    } catch (err) {
      console.error('Video playback failed:', err);
      this.navigateToTarget();
    }
  }

  onAnimationEnd() {
    this.navigateToTarget();
  }

  private async navigateToTarget() {
    const fadeOut = this.animationCtrl.create()
      .addElement(this.videoRef.nativeElement)
      .duration(800)
      .fromTo('opacity', 1, 0);

    await fadeOut.play();
    this.navCtrl.navigateRoot('/tabs/LOZ', { animated: false });
  }
}
