let btnUp = document.querySelector(`.btn-up`);
window.addEventListener(`scroll`, function () {
    let scrollY = window.scrollY;
    if (scrollY > 70) {
        btnUp.classList.remove('d-none');
    } else {
        btnUp.classList.add('d-none');
    }
});