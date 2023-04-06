let express = require(`express`);
let app = express();
let port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`Server has been started! ${port}`);
});

let hbs = require('hbs');
app.set('view engine', 'hbs');
app.set('views', 'views');

let mongoose = require(`mongoose`);
mongoose.connect("mongodb+srv://Admin:UcH-MF2-QnN-CtJ@museum.gro82ka.mongodb.net/museum");
//UcH-MF2-QnN-CtJ
app.use(express.static(`public`));
app.use(express.urlencoded({ extended: true }));

let articleSchema = mongoose.Schema({
    title: String,
    category: Array,
    description: String,
    text: String,
    image: String
});

let Article = mongoose.model('article', articleSchema);

app.get(`/`, async (req, res) => {
    let category = req.query.category;
    search = {};

    if (category) {
        search.category = category;
    }

    let data = await Article.find(search);

    res.render(`index`, {articles: data});
});

app.get(`/article`, async (req, res) => {
    let id = req.query.id;
    
    if (id) {
        let data = await Article.findOne({_id: id});

        res.render(`article`, {article: data});
    } else {
        res.render(`404`);
    }
});