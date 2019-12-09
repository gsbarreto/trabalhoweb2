document.getElementById("search-input").addEventListener("keyup", e => {
  const input = e.target.value;
  if (input.length >= 3) {
    document.getElementsByClassName("loading")[0].style.display = "flex";
    axios.get("/busca?parametro=" + input).then(e => {
      const array = e.data;
      if (array.length > 0) {
        let stringToAdd = "";
        array.map(item => {
          stringToAdd += `<li><a href="/?search=${item.title}">${item.title}</a></li>`;
        });

        document.getElementById("search-links").innerHTML = stringToAdd;
      } else {
        document.getElementById("search-links").innerHTML =
          "<li>Nada encontrado!</li>";
      }

      document.getElementsByClassName("loading")[0].style.display = "none";
    });
    console.log(input);
  } else if (input.length === 0 || input === "") {
    document.getElementById("search-links").innerHTML = "";
  } else {
    document.getElementById("search-links").innerHTML =
      "<li>Minimo de 3 caractéres</li>";
  }
});

document.addEventListener("click", e => {
  if (!document.getElementById("search-input").contains(e.target)) {
    document.getElementById("search-links").innerHTML = "";
  }
});
