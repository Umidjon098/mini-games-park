/** Home page: small Lottie animation + sound badge. */

export function initHomePage() {
  const host = document.getElementById('lottieHero');
  if (host && globalThis.lottie) {
    // A public Lottie JSON hosted via lottiefiles CDN.
    // If it fails due to CORS/network, page still works.
    try {
      globalThis.lottie.loadAnimation({
        container: host,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets10.lottiefiles.com/packages/lf20_2LdLki.json',
      });
    } catch {
      // ignore
    }
  }
}
