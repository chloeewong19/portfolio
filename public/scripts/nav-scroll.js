window.addEventListener('scroll', function () {
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 30)
}, { passive: true })
