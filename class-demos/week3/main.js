// alert("linked")

console.log('consolelog');

window.onload = async () => {
    console.log("loaded");

    // document.getElementById('important');

    document.getElementById('important').innerHTML = "<span>span</span> changed 1111";

    let important_paragraph = document.getElementById('important');
    important_paragraph.style.backgroundColor = "red";

    important_paragraph.classList.add('hide');


    let c = document.getElementById("container");
    let i = document.createElement('img');
    i.src = "assets/fl_1.jpg";
    c.appendChild(i);

    c.addEventListener("click",() =>{
        console.log("click");
        if(important_paragraph.classList.contains('hide')){
            important_paragraph.classList.remove('hide');
        }else{
            important_paragraph.classList.add('hide');
        }
    })


    let blues = document.getElementsByClassName("blue");

    for (let b of blues){
        b.style.border = "2px solid blue";
    }


    let params = new URLSearchParams({
        apikey: "1c2eb4cd",
        s: "Transformers",
        type: "movie",
    });
    let url = "http://www.omdbapi.com/?" + params;
    console.log(url);
    console.log(params);
    let response = await fetch(url);
    console.log(response);
    let data = await response.json();
    console.log(data);

    let movies = data.Search;
    for (let m of movies){
        let div = document.createElement('div');
        div.textContent = m.Title;
        let poster = document.createElement('img');
        poster.src = m.Poster;
        div.appendChild(poster);
        c.appendChild(div);
    }
}

