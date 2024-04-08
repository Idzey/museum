onBtn(false);
function onBtn(flag) {
    if (flag) {
        let btns_delete = document.querySelectorAll('.btn-delete');
        for (let i = 0; i < btns_delete.length; i++) {
            let btn = btns_delete[i];
            btn.classList.remove('d-none');
        }
    } else {
        let btns_delete = document.querySelectorAll('.btn-delete');
        for (let i = 0; i < btns_delete.length; i++) {
            let btn = btns_delete[i];
            btn.classList.add('d-none');
        }
    }
}
let conf_delete = document.querySelectorAll('.conf-delete');
for (let i = 0; i < conf_delete.length; i++) {
    let btn = conf_delete[i];
    btn.addEventListener('click', (evt) => {
        if (evt.target.checked == true) {
            onBtn(true);
        } else {
            onBtn(false);
        }
    });
}

axios.defaults.headers.post['Content-Type'] = 'application/json';

let categories = document.querySelectorAll('.category');
let node_articles = document.querySelector('.articles');
let node_activity = document.querySelector('.activity');

loadPage();

for (let i = 0; i < categories.length; i++) {
    let category = categories[i];
    let category_value = category.id;

    category.addEventListener('click', async function () {
        for (let b = 0; b < categories.length; b++) {
            categories[b].querySelector('.card').classList.remove('category_active');
        }

        category.querySelector('.card').classList.add('category_active');
        let response = await axios.get('/articles/category', {
            params: {
                category: category_value
            }
        });
        let data = response.data;

        renderArticles(data);
    });
}

function loadPage() {
    loadActivity();
    loadArticles();
}

async function loadArticles() {
    categories[0].querySelector('.card').classList.add('category_active');
    let response = await axios.get('/articles/category');
    let data = response.data;
    renderArticles(data);
}

async function loadActivity() {
    let response = await axios.get('/posts/last');
    let data = response.data;
    renderActivity(data);
}

function renderArticles(data) {
    node_articles.innerHTML = ``;
    let node = ``;
    for (let i = 0; i < data.length; i++) {
        let article = data[i];
        let categoriesNode = ``;
        let categoriesArticle = article.category;
        for (let a = 0; a < categoriesArticle.length; a++) {
            categoriesNode += `<span class="text-uppercase badge bg-primary me-2">${categoriesArticle[a]}</span>`;
        }
        let display_img = ``;
        let col_text = ``;
        let jc = ``;
        if (!article.image) {
            display_img = `d-none`;
            col_text = `col-lg-9`;
            jc = `justify-content-center`;
        }
        node += `<a href="/article?id=${article._id}" class="article wow fadeInLeft">
        <article class="row ${jc}">
            <div class="${display_img} col-lg-4 col-md-12 d-flex align-items-center justify-content-center">
                <img src="${article.image}" alt="" class="img-fluid" loading="lazy">
            </div>
            <div class="${col_text}col-lg-8 col-md-12 article_text">`
            + categoriesNode +
            `<h2 class="ff-sen">${article.title}</h2>
            <p class="text-muted">${article.description}</p>
            </div>
        </article>
        </a>`
    }
    node_articles.innerHTML = node;
}
function renderActivity(data) {
    node_activity.innerHTML = ``;
    let node = ``;
    for (let i = 0; i < data.length; i++) {
        let activity = data[i];
        let text = activity.text;
        text = text.replace(/<(.|\n)*?>/g, '');
        node += `
          <div class="card p-0 wow fadeInLeft" style="width: 18rem;">
            <a href="/post?id=${activity._id}">
              <img src="/assets/activity/${activity.image}" class="card-img-top" alt="Nope">
              <div class="card-body">
                <h5 class="card-title fw-bold">${activity.title}</h5>
                <p class="card-subtitle mb-2 text-body-secondary">${dayjs(activity.createdAt).format("DD.MM.YYYY")}</p>
                <p class="card-text border-top pt-1">${text}</p>
              </div>
            </a>
          </div>
        `;
    }
    node_activity.innerHTML = node;
}