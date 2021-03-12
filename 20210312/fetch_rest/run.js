const R = require('ramda');
const fetch = require('node-fetch');

const URL_USERS = 'https://jsonplaceholder.typicode.com/users';
const URL_POSTS = 'https://jsonplaceholder.typicode.com/posts';

const get = url => fetch(url).then(r => r.json());

Promise.all([get(URL_USERS), get(URL_POSTS)]).then(([users, posts]) => {
    users.forEach(user => {
        console.log({
            "nom_utilisateur" : getUsername(user),
            "ville" : getCity(user),
            "nom_compagnie" : getCompanyName(user),
            "titres_posts" : getPostTitles(user, posts)
        })
    });
})

let getUsername = user => {return R.path(['username'], user)};

let getCity = user => {return R.path(['address', 'city'], user)};

let getCompanyName = user => {return R.path(['company', 'name'], user)};

let getPostTitles = (userJson, postsJson) => {
    let titles = [];
    let id = R.path(['id'], userJson);

    postsJson.find(post => {
        if(R.path(['userId'], post) == id) {
            titles.push(R.path(['title'], post))
        }
    })

    return titles;
}





