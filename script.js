const searchBox = document.getElementById("search-box");
const searchRepo = document.getElementById("search-repo");
const searchButton = document.getElementById("search-btn");
const reposSection = document.getElementById("repos");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");
const range = document.getElementById("form-range");
const rangeVal = document.getElementById("range-value");

let currentPage = 0;
let reposPerPage = 10;
let totalPages = 0;
let resData;
let username;

function fetchRepos(username) {
  let url;
  if (totalPages === 0) {
    // at first fetching all the repos to count the total pages.
    url = `https://api.github.com/users/${username}/repos?sort=updated&direction=desc&topics=true`;
  } else {
    // after total page is fetched then fetching the repos according to the page
    url = `https://api.github.com/users/${username}/repos?sort=updated&direction=desc&page=${currentPage}&per_page=${reposPerPage}&topics=true`;
  }

  reposSection.innerHTML =
    '<div class="loader"><img src="images/loader.gif" class="loader" /></div>'; //adding loader

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      resData = data;
      reposSection.innerHTML = ""; //removing loader
      if (totalPages === 0) {
        totalPages = Math.ceil(data?.length / reposPerPage); //setting the value of total pages
      }
      if (currentPage == 1) {
        displayRepos(data?.slice(0, reposPerPage));
      } else {
        displayRepos(data);
      }
      updatePageInfo();
    })
    .catch(() => displayNotFound());
}

function searchRepos() {
  const searchTerm = searchRepo.value.trim(); //search value from the repository search
  const result = resData.filter((item) =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (result.length) {
    currentPage = 1;
  }
  totalPages = Math.ceil(result.length / reposPerPage); //updating the value of total pages
  updatePageInfo();
  displayRepos(result);
}

//function for when no repository is found
function displayNotFound() {
  currentPage = 0;
  totalPages = 0;
  const noReposMessage = document.createElement("h2");
  noReposMessage.textContent = "No repositories found ☠️☠️";
  reposSection.appendChild(noReposMessage);
}

//function to display repos
function displayRepos(repos) {
  reposSection.innerHTML = "";

  if (repos?.length === 0) {
    displayNotFound();
  } else {
    repos?.forEach((repo) => {
      const repoDiv = document.createElement("div");
      repoDiv.className = "repo";

      const titleDiv = document.createElement("div");
      titleDiv.className = "title";

      const nameLink = document.createElement("a");
      nameLink.textContent = repo?.name;
      nameLink.href = repo?.html_url;

      titleDiv.appendChild(nameLink);
      repoDiv.appendChild(titleDiv);

      if (repo?.description) {
        const descriptionParagraph = document.createElement("div");
        descriptionParagraph.textContent = repo.description || "";
        repoDiv.appendChild(descriptionParagraph);
      }

      const languageSpan = document.createElement("span");
      languageSpan.textContent = `Language: ${repo?.language || "N/A"}`;
      repoDiv.appendChild(languageSpan);

      const topicDiv = document.createElement("div");
      topicDiv.className = "topics";

      if (repo.topics && repo.topics.length > 0) {
        repo.topics.forEach((topic) => {
          const topicsSpan = document.createElement("span");
          topicsSpan.textContent = `${topic}`;
          topicDiv.appendChild(topicsSpan);
        });
      }

      repoDiv.appendChild(topicDiv);

      reposSection.appendChild(repoDiv);
    });
  }
}

function updatePageInfo() {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function handlePrevBtn() {
  //function to go back to the previous page
  console.log("prev");
  if (currentPage >= 1) {
    currentPage--;
    fetchRepos(username);
  }
}

function changeReposPerPage() {
  reposPerPage = range.value;
  totalPages = Math.ceil(resData?.length / reposPerPage); //updating total pages after changing repos per page
  rangeVal.innerText = range.value;
  currentPage = 1;
  fetchRepos(username);
}

function handleNextBtn() {
  //function to go back to the next page
  console.log("Next");
  if (currentPage < totalPages) {
    currentPage++;
    fetchRepos(username);
  }
}

searchButton.addEventListener("click", () => {
  //searching repos after clicking the button
  username = searchBox.value.trim();
  console.log(username);
  currentPage = 1;
  fetchRepos(username);
});

searchRepo.addEventListener("input", searchRepos);
prevBtn.addEventListener("click", handlePrevBtn);
nextBtn.addEventListener("click", handleNextBtn);
range.addEventListener("change", changeReposPerPage);

updatePageInfo();
