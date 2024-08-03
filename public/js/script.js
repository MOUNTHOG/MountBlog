document.addEventListener('DOMContentLoaded', function() {
    const searchbutton = document.querySelector('.searchBtn');
    const searchbar = document.querySelector('.searchBar');
    const close = document.querySelector('#searchClose');
    const navbar = document.querySelector('.header_nav');
    const search = document.querySelector('.header_button');
    searchbutton.addEventListener('click',() => {
        searchbar.style.visibility = "visible";
        searchbar.classList.add('open');
        searchbar.setAttribute('aria-expanded', 'true');
        navbar.style.filter = "blur(3px)";
        search.style.filter = "blur(3px)";
    });
    close.addEventListener('click',() => {
        searchbar.style.visibility = "hidden";
        searchbar.classList.add('close');
        searchbar.setAttribute('aria-expanded', 'false');
        navbar.style.filter = "none";
        search.style.filter = "none";
    });
    
});