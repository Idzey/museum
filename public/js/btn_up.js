let btnUp = document.querySelector(`.btn-up`);
window.addEventListener(`scroll`, function () {
    let scrollY = window.scrollY;
    if (scrollY > 70) {
        btnUp.classList.remove('d-none');
    } else {
        btnUp.classList.add('d-none');
    }

    window.onscroll = function(evt) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
           btnUp.classList.add(`btn-up-notfooter`);
        } else {
            btnUp.classList.remove(`btn-up-notfooter`);
        }
    };
});