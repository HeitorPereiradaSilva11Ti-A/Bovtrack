const toggleButton = document.querySelector(".theme-toggle")

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body
    
    // Darkmode : bool
    const darkModeValue = JSON.parse(localStorage.getItem("darkmode"))
    changeColors(darkModeValue)
    
    if (darkModeValue) body.classList.add("darkmode")
    else body.classList.remove("darkmode")

    // Lógica do Menu Hambúrguer (Mobile)
    const hamburgerBtn = document.getElementById('hamburgerBtn')
    const navMenu = document.getElementById('navMenu')

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active')
            navMenu.classList.toggle('active')
        })
    }
})

function toggleModes() {
    const body = document.body
    body.classList.toggle("darkmode")
    
    const isDarkmode = body.classList.contains("darkmode")
    localStorage.setItem("darkmode", JSON.stringify(isDarkmode))
    console.log(isDarkmode)
    changeColors(isDarkmode)
    window.location.reload()
}

function changeColors(darkmode) {
    const root = document.documentElement

    const changeThemeIcon = document.querySelector("#changeTheme i")
    if (!darkmode && changeThemeIcon) {
        changeThemeIcon.classList.remove("bi-moon")
        changeThemeIcon.classList.add("bi-brightness-high")
    }

    // Background images
    const images = document.querySelectorAll("img")
    images.forEach(img => {
        if (darkmode) {
            // Troca "-claro" por "-escuro" na URL do ficheiro
            img.src = img.src.replace('-claro', '-escuro');
        } else {
            // Troca "-escuro" por "-claro" ao voltar para o tema claro
            img.src = img.src.replace('-escuro', '-claro');
        }
    });

    // Ta preto
    if (darkmode) {
        root.style.setProperty('--white', '#000000')
        root.style.setProperty('--light-gray','#2B2A33')
        root.style.setProperty('--dark-gray','#e6e2e7')
        root.style.setProperty('--black', '#ffffff');
        root.style.setProperty('--light-purple', '#2b0f30');
        root.style.setProperty('--purple-white', '#e9e4ec');
        root.style.setProperty('--dark-purple', '#6C448B');
        root.style.setProperty('--bg-color', '#2B2A33');
        root.style.setProperty('--box-shadow', 'rgba(0, 0, 0, 0.5)');
        root.style.setProperty('--dark-purple-shadow', '#9848bd');
    // Ta branco
    } else {
        root.style.setProperty('--white', '#ffffff')
        root.style.setProperty('--light-gray','#e6e2e7')
        root.style.setProperty('--dark-gray','#1e1c20')
        root.style.setProperty('--black', '#000000');
        root.style.setProperty('--light-purple', '#5d5360');
        root.style.setProperty('--purple-white', '#282729');
        root.style.setProperty('--dark-purple', '#2b0f30');
        root.style.setProperty('--bg-color', '#f3f2f4');
        root.style.setProperty('--box-shadow', 'rgba(0, 0, 0, 0.05)');
        root.style.setProperty('--dark-purple-shadow', '#18061b');
    }
}

if (toggleButton) {
    toggleButton.addEventListener('click', toggleModes)
}