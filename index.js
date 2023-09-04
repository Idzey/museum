// CREATED BY Idzey
let express = require(`express`);
let app = express();
let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server has been started! ${port}`);
});

let hbs = require('hbs');
app.set('view engine', 'hbs');
app.set('views', 'views');

let dayjs = require('dayjs');

let mongoose = require(`mongoose`);
mongoose.connect("mongodb+srv://Admin:UcH-MF2-QnN-CtJ@museum.gro82ka.mongodb.net/museum");

app.use(express.static(`public`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let articleSchema = new mongoose.Schema({
    title: String,
    category: Array,
    description: String,
    text: String,
    image: String
}, {
    timestamps: true
});

let Article = mongoose.model('article', articleSchema);

let imageSchema = new mongoose.Schema({
    title: String,
    img_src: String
}, {
    timestamps: true
});

let Image = mongoose.model('image', imageSchema);

let postSchema = new mongoose.Schema({
    title: String,
    image: String,
    text: String,
}, {
    timestamps: true
});

let Post = mongoose.model('post', postSchema);

let adminSchema = new mongoose.Schema({
    login: String,
    password: String
});

let Admin = mongoose.model('user', adminSchema);

let documentSchema = new mongoose.Schema({
    title: String,
    src: String
});

let Document = mongoose.model('document', documentSchema);

let albumSchema = new mongoose.Schema({
    title: String,
    photos: [{
        type: mongoose.ObjectId,
        ref: 'image'
    }]
}, {
    timestamps: true
});

let Album = mongoose.model('album', albumSchema);

app.get(`/`, async (req, res) => {
    res.render(`index`);
});

app.get(`/articles`, async (req, res) => {
    let category = req.query.category;
    let title = req.query.title;
    let radio = Number(req.query.sort);
    

    let search = {};

    if (category) {
        search.category = category;
    }
    if (title) {
        search.title = {$regex: new RegExp(title, 'i')};
    }
    if (!radio) {
        radio = -1;
    }
    saveValue = {
        title: title,
        radioUp: radio == -1,
        radioDown: radio == 1
    }

    let select = `<option value="" selected>Все</option>`;
    let categories = ["Школа", "Посёлок", "Разное"];
    for (let i = 0; i < categories.length; i++) {
        if (categories[i] == category) {
            select += `<option value="${categories[i]}" selected>${categories[i]}</option>`;
        } else {
            select += `<option value="${categories[i]}">${categories[i]}</option>`;
        }
    }

    let data = await Article.find(search).sort({ createdAt: radio });
    
    for (let i = 0; i < data.length; i++) {
        let article = data[i];
        if (!article.image) {
            article.img_flag = true;
        } else {
            article.img_flag = false;
        }
    }

    let pageCount = Math.ceil(data.length / 10);
    let page = Number(req.query.page);
    if (!page) { page = 1;}
    if (page > pageCount) {
        page = pageCount
    }
    
    let node;

    if (pageCount > 1) {
        data = data.slice(page*10 - 10, page*10);
        
        node = `
        <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
            <div class="btn-group border border-3 me-2" role="group" aria-label="First group">
        `;
            for (let i = 1; i <= pageCount; i++) {
                let selected;
                if (i == page) {
                    selected = `btn-primary`;
                }

                if (title == undefined) {
                    title = ``;
                }
                if (category == undefined) {
                    category = ``;
                }

                node += `<a href="/articles?title=${title}&category=${category}&sort=${radio}&page=${i}" type="button" class="btn ${selected}">${i}</a>`;
            }
        node += `
            </div>
        </div>
        `;
    }

    res.render(`articles`, { articles: data, value: saveValue, select: select, pagination: node});
});

app.get('/articles/category', async (req,res) => {
    let category = req.query.category;
    let data;
    if (category) {
        data = await Article.find({category: category}).sort({createdAt: -1}).limit(3);
    } else{
        data = await Article.find().sort({createdAt: -1}).limit(3);
    }
    res.send(data);
});

app.get(`/article`, async (req, res) => {
    let id = req.query.id;

    try {
        let data = await Article.findOne({ _id: id });

        let no_photo = true;
        if (data.image == 'assets/no-photo.jpg') {
            no_photo = false;
        }

        res.render(`article`, { article: data, no_photo: no_photo});
    } catch (err) {
        res.render(`404`);
    }
});


app.get(`/about`, async function (req, res) {
    res.render(`about`);
});

app.get(`/photos`, async function (req, res) {
    let albums = await Album.find().populate('photos');
    for (let i = 0; i < albums.length; i++) {
        let album = albums[i];
        if (album.photos.length != 0) {
            album.images = album.photos[album.photos.length - 1].img_src;
        }
    }
    
    res.render(`gallery`, { albums: albums });
});

app.get(`/gallery/album`, async function (req, res) {
    try {
        let id = req.query.id;
        let album = await Album.findOne({_id: id}).populate('photos');

        let sort = [];
        for (let i = album.photos.length - 1; i >= 0; i--) {
            let img = album.photos[i];
            sort.push(img);
        }
        album.photos = sort;

        res.render(`album`, { album: album });
    } catch {
        res.render('404')
    }
});

app.get(`/documents`, async function (req,res) {
    let documents = await Document.find();
    res.render('documents', {documents: documents});
});

app.get('/activity', async function (req,res) {
    let posts = await Post.find().sort({createdAt: -1});
    for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        post.date = dayjs(post.createdAt).format("DD.MM.YYYY");
    }
    res.render('activity', {posts: posts});
});

app.post('/activity/date', async function (req,res) {
    if (req.body.date != '') {
        let date = dayjs(req.body.date).format("DD.MM.YYYY");

        let posts_node = await Post.find().sort({createdAt: -1});
        let posts = [];

        for (let i = 0; i < posts_node.length; i++) {
            let post = posts_node[i];
            if (dayjs(post.createdAt).format("DD.MM.YYYY") == date) {
                posts.push(post);
            }
        }

        for (let i = 0; i < posts.length; i++) {
            let post = posts[i];
            post.date = dayjs(post.createdAt).format("DD.MM.YYYY");
        }

        res.render('activity', {posts: posts, date: req.body.date});
    } else {
        res.redirect('/activity');
    }
});

app.get('/post', async function (req,res) {
    let id = req.query.id;
    try {
        let post = await Post.findOne({_id: id});
        post.date = dayjs(post.createdAt).format("DD.MM.YYYY"); 
        res.render('post', {post: post})
    } catch (err) {
        res.render('404');
    }
});

app.get('/posts/last', async function (req,res) {
    let posts = await Post.find().sort({createdAt: -1}).limit(3);
    res.send(posts);
});



// ADMIN PANEL
let md5 = require(`md5`);
let session = require(`express-session`);
let multer = require(`multer`);


app.use(session({
    secret: `o~u|P1@WN5Gl`,
    resave: true,
    saveUninitialized: true,
}));


let storageConfig1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/assets/photos");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

let storageConfig2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/assets/articles");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

let storageConfig3 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/assets/activity");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

let upload1 = multer({ storage: storageConfig1 });
let upload2 = multer({ storage: storageConfig2 });
let upload3 = multer({ storage: storageConfig3 });




app.get(`/admin`, async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        res.redirect(`/admin-link`);
    } else {
        let error = req.query.error;

        res.render(`login`, { err: error });
    }
});

app.get(`/admin-link`, async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        res.render(`admin-link`);
    } else {
        res.redirect(`/admin`);
    }
});

app.post(`/login`, async function (req, res) {
    let login = req.body.login;
    let password = req.body.password;
    login = login.replaceAll(' ', '');

    if (await Admin.findOne({ login: login })) {
        let admin = await Admin.findOne({ login: login });
        if (admin.password == md5(password)) {
            req.session.login = login;
            req.session.pass = md5(password);

            res.redirect(`/admin-link`);
        } else {
            res.redirect(`/admin?error=1`);
        }
    } else {
        res.redirect(`/admin?error=1`);
    }
});

app.get(`/gallery/album-admin`, async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let id = req.query.id;
        let album = await Album.findOne({_id: id}).populate('photos');

        let sort = [];
        for (let i = album.photos.length - 1; i >= 0; i--) {
            let img = album.photos[i];
            sort.push(img);
        }
        album.photos = sort;

        res.render(`album-admin`, { album: album });
    } else {
        res.redirect('/admin');
    }
});

app.get(`/create-image`, async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let success = req.query.success;
        let error = req.query.error;
        let albums = await Album.find().populate('photos');
        for (let i = 0; i < albums.length; i++) {
            let album = albums[i];
            if (album.photos.length != 0) {
                album.images = album.photos[0].img_src;
            }
        }

        res.render(`create-image`, { albums: albums, success: success, error: error });
    } else {
        res.redirect(`/admin`);
    }
});

app.post(`/create-image`, upload1.single("filedata"), async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        try {
            let title = req.body.title;
            let img_src = 'assets/photos/' + req.file.originalname;

            let image = new Image({
                title: title,
                img_src: img_src
            });
            await image.save();

            let album_title = req.body.album;

            let album = await Album.findOne({title: album_title});
            album.photos.push(image._id);
            await album.save();

            let filedata = req.file;
            res.redirect(`/create-image?success=1`);
        } catch (err) {
            res.redirect(`/create-image?error=1`);
        }
    } else {
        res.redirect(`/admin`);
    }
});


app.post(`/create-album`, async function (req,res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let title = req.body.title;
        let album = new Album({
            title: title,
            photos: []
        });
        await album.save();
        res.redirect('/create-image?success=1')
    } else {
        res.redirect(`/admin`);
    }
});

app.get(`/delete-album`, async function (req,res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let id = req.query.id;
        await Album.deleteOne({_id: id});
        res.redirect('/create-image?success=1');
    } else {
        res.redirect(`/admin`);
    }
});



app.get(`/create-document`, async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let success = req.query.success;
        let error = req.query.error;
        let documents = await Document.find();

        res.render(`create-document`, { documents: documents, success: success, error: error });
    } else {
        res.redirect(`/admin`);
    }
});

app.post(`/create-document`, async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        try {
            let title = req.body.title;
            let src = req.body.url;

            let document = new Document({
                title: title,
                src: src
            });
            await document.save();
            res.redirect(`/create-document?success=1`);
        } catch (err) {
            res.redirect(`/create-document?error=1`);
        }
    } else {
        res.redirect(`/admin`);
    }
});


let fs = require(`fs`);

app.get('/delete-image', async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let id = req.query.id;
        try {
            let image = await Image.findOne({ _id: id });
            fs.unlinkSync(`public/${image.img_src}`);
            await Image.deleteOne({ _id: id });

            let album = await Album.findOne({photos: id});
            let result = album.photos.filter(item => item != id);
            album.photos = result;
            await album.save();

        } catch (err) {

        }
        res.redirect('back');
    } else {
        res.redirect(`/admin`);
    }
});

app.get(`/create-article`, async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let data = await Article.find().sort({createdAt: -1});
        for (let i = 0; i < data.length; i++) {
            let article = data[i];
            if (!article.image) {
                article.img_flag = true;
            } else {
                article.img_flag = false;
            }
        }

        res.render(`create-article`, { articles: data });
    } else {
        res.redirect(`/admin`);
    }
});

app.post(`/create-article`, upload2.single("filedata"), async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let title = req.body.title;
        let image;
        if (req.file) {
            image = 'assets/articles/' + req.file.originalname;
        } else {
            image = '';
        }
        let text = req.body.text;
        let description = req.body.description;
        let category = [];

        if (req.body.check_school == `on`) {
            category.push('Школа');
        }
        if (req.body.check_village == `on`) {
            category.push('Посёлок');
        }
        if (req.body.check_different == `on`) {
            category.push('Разное');
        }

        let article = new Article({
            title: title,
            image: image,
            text: text,
            description: description,
            category: category
        });


        try {
            await article.save();
            if (req.file) {
                let filedata = req.file;
            }
            res.redirect(`/create-article?success=1`);
        } catch (err) {
            res.redirect(`/create-article?error=1`);
        }
    } else {
        res.redirect(`/admin`);
    }
});

app.get('/delete-article', async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let id = req.query.id;
        try {
            let article = await Article.findOne({ _id: id });
            if (fs.existsSync(`public/${article.image}`) && article.image != '') {
                fs.unlinkSync(`public/${article.image}`);
            }
            await Article.deleteOne({ _id: id });
        } catch (err) {

        }
        res.redirect('back');
    } else {
        res.redirect(`/admin`);
    }
});

app.get('/delete-document', async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let id = req.query.id;
        try {
            await Document.deleteOne({ _id: id });
        } catch (err) {
            
        }
        res.redirect('back');
    } else {
        res.redirect(`/admin`);
    }
});


app.get(`/create-document`, async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let success = req.query.success;
        let error = req.query.error;
        let documents = await Document.find();

        res.render(`create-document`, { documents: documents, success: success, error: error });
    } else {
        res.redirect(`/admin`);
    }
});

app.post(`/create-document`, async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        try {
            let title = req.body.title;
            let src = req.body.url;

            let document = new Document({
                title: title,
                src: src
            });
            await document.save();
            res.redirect(`/create-document?success=1`);
        } catch (err) {
            res.redirect(`/create-document?error=1`);
        }
    } else {
        res.redirect(`/admin`);
    }
});

app.get(`/create-post`, async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let success = req.query.success;
        let error = req.query.error;
        let posts = await Post.find().sort({createdAt: -1});

        res.render(`create-post`, { posts: posts, success: success, error: error });
    } else {
        res.redirect(`/admin`);
    }
});

app.post(`/create-post`, upload3.single("filedata"), async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        try {
            let title = req.body.title;
            let text = req.body.text;
            let image = req.file.originalname;

            let post = new Post({
                title: title,
                text: text,
                image: image
            });
            await post.save();

            let filedata = req.file;
            res.redirect(`/create-post?success=1`);
        } catch (err) {
            res.redirect(`/create-post?error=1`);
        }
    } else {
        res.redirect(`/admin`);
    }
});

app.get('/delete-post', async function (req, res) {
    if ((await Admin.find({ login: req.session.login, password: req.session.pass })).length > 0) {
        let id = req.query.id;
        try {
            let post = await Post.findOne({ _id: id });
            fs.unlinkSync(`public/assets/activity/${post.image}`);
            await Post.deleteOne({ _id: id });
        } catch (err) {

        }
        res.redirect('back');
    } else {
        res.redirect(`/admin`);
    }
});

app.get(`*`, function (req,res) {
    res.render(`404`);
});