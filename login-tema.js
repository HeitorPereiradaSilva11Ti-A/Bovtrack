// Botão da lua nas telas de login e cadastro.
// Salva no mesmo "darkmode" do changemode.js, então o resto do site acompanha.
document.getElementById('btn-tema').addEventListener('click', () => {
  const escuro = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('darkmode', JSON.stringify(escuro)); } catch (e) {}
});
