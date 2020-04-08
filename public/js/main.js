let inputName  = document.querySelector('input.accountName');
let getStories = document.querySelectorAll('.getStories');
let searchWrap = document.querySelector('.searchWrap');
let modal = document.querySelector('.storys_modal');
let closeModal = document.querySelector('.storys_modal .fa-times');

let scene = document.getElementById('scene');
let parallaxInstance = new Parallax(scene);
parallaxInstance.scalar(12, 12);
parallaxInstance.friction(0.02, 0.02)

closeModal.addEventListener('click', function() {
    modal.classList.remove('active');
});

fetch('/userinfo', {
    method: "POST",
    body: JSON.stringify({name: 'printlabshop'}),
    credentials: 'same-origin',
    headers: {
        'Content-Type': 'application/json'
      },
}).then((response) => {
    return response.json();
}).then((data) => {
    console.log(JSON.parse(data));
});

inputName.addEventListener('keyup', function() {
    let accName = inputName.value;
        fetch('/search', {
            method: "POST",
            body: JSON.stringify({name: accName}),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
              },
        }).then((response) => {
            return response.json();
        }).then((data) => {
            renderSearch(data);
        });
});

function renderSearch(data) {
    searchWrap.innerHTML = "";
    let result = JSON.parse(data);
    // console.log(result);
    for(let i = 0; i < 6; i++) {
        if (result.users[i] !== undefined) {
            let name = result.users[i].user.username;
            let fullName = result.users[i].user.full_name;
            let img = result.users[i].user.profile_pic_url;
    
            let item = `
                <div class="item getStories">
                    <div class="preloader">
                        <span>получаем сторис</span>
                        <img src="img/preloader.gif">
                    </div>
                    <img src="${img}">
                    <div class="names">
                        <span class="name">${name}</span>
                        <span class="fullName">${fullName}</span>
                    </div>
                </div>
            `;
            searchWrap.innerHTML += item;
        }
    }
    getStories = document.querySelectorAll('.getStories');
    getStories.forEach(function(el) {
        el.addEventListener('click', function() {
            let name = el.querySelector('.name').textContent;
            let preloader = el.querySelector('.preloader');
            let itemsWrap = el.parentElement;
            itemsWrap.style.pointerEvents = "none";
            preloader.classList.add('active');
            inputName.value = name;

            if (name !== "") {
                fetch('/getstories', {
                    method: "POST",
                    body: JSON.stringify({name: name}),
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                      },
                }).then((response) => {
                    return response.json();
                }).then((data) => {
                    itemsWrap.style.pointerEvents = "all";
                    preloader.classList.remove('active');
                    // console.log(JSON.parse(data));
                    renderStories(JSON.parse(data));
                });
            };
        });
    });
}





function renderStories(data) {
    modal.classList.add('active');
    
    let storriesWrap = document.querySelector('.storiesWrap');
    let stories = [];
    let storysInfo = JSON.parse(data.storysInfo);
    let userInfo = JSON.parse(data.userInfo);
    console.log(userInfo);
    for(let i = 0; i < storysInfo.items.length; i++) {
        if (storysInfo.items[i].video_versions === undefined) {
            stories.push(storysInfo.items[i].image_versions2.candidates[0].url);
        } else {
            stories.push(storysInfo.items[i].video_versions[0].url);
        }
    };

    storriesWrap.innerHTML = "";
    for(let i = 0; i < stories.length; i++) {
        if (stories[i].indexOf('jpg') !== -1) {
            let item = `
            <div class="imgWrap">
                <img src="${stories[i]}">
            </div>
            
            `;
            storriesWrap.innerHTML += item;
        } 
        if (stories[i].indexOf('mp4') !== -1) {
            let item = `
            <div class="videoWrap">
                <video src="${stories[i]}" controls></video>
            </div>
            `;
            storriesWrap.innerHTML += item;
        }
    };

    let infoContainer = document.querySelector('.storys_modal .info');
    infoContainer.innerHTML = "";
    let img = userInfo.graphql.user.profile_pic_url;
    let name = userInfo.graphql.user.username;
    let fullName = userInfo.graphql.user.full_name;
    let posts = userInfo.graphql.user.edge_owner_to_timeline_media.count;
    let podpisok = userInfo.graphql.user.edge_follow.count;
    let podpischikov = userInfo.graphql.user.edge_followed_by.count;

    let infoLayout = `
    <div class="info__img">
        <img src="${img}" alt="">
    </div>
    <div class="info__names">
        <span class="name">${name}</span>
        <span class="fullName">${fullName}</span>
    </div>
    <div class="info__stats">
        <span>Публикаций </span>
        <p>${posts}</p>
        <span>Подписчиков </span>
        <p>${podpischikov}</p>
        <span>Подписок </span>
        <p>${podpisok}</p>
    </div>
    `;

    infoContainer.innerHTML = infoLayout;
};