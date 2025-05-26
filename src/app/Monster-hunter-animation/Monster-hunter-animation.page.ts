import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AnimationController, NavController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-monster-hunter-animation',
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
export class MonsterHunterAnimationPage implements AfterViewInit {
  @ViewChild('animationPlayer') videoRef!: ElementRef<HTMLVideoElement>;
  currentAnimation = '';
  private readonly playedFlagKey = 'mhAnimationPlayed';

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private animationCtrl: AnimationController
  ) {
    // Statt localStorage jetzt sessionStorage verwenden:
    if (sessionStorage.getItem(this.playedFlagKey) === 'true') {
      this.navCtrl.navigateRoot('/tabs/Monster-Hunter', { animated: false });
      return;
    }

    // Flag für diese Session setzen
    sessionStorage.setItem(this.playedFlagKey, 'true');

    // Wie gehabt: Animation-Quelle basierend auf Origin auswählen
    const nav = this.router.getCurrentNavigation();
    const origin = nav?.extras?.state?.['origin'];

    if (origin === 'LOZ') {
      this.currentAnimation = 'assets/animations/LOZ-Monster-Hunter.mp4';
    } else if (origin === 'tab3') {
      this.currentAnimation = 'assets/animations/Home-Monster-Hunter.mp4';
    } else {
      this.navCtrl.navigateRoot('/tabs/Monster-Hunter', { animated: false });
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
    this.navCtrl.navigateRoot('/tabs/Monster-Hunter', { animated: false });
  }
}
