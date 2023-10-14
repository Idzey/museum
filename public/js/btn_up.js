let btnUp = document.querySelector(`.btn-up`);
btnUp.classList.remove('d-none')
window.addEventListener(`scroll`, function () {
    let scrollY = window.scrollY;
    if (scrollY > 70) {
        btnUp.classList.add('active');
    } else {
        btnUp.classList.remove('active');
    }

    window.onscroll = function(evt) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
           btnUp.classList.add(`btn-up-notfooter`);
        } else {
            btnUp.classList.remove(`btn-up-notfooter`);
        }
    };
});
