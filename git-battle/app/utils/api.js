var axios = require('axios');

const githubUrl = 'https://api.github.com/users/';

function getProfile(username) {
  return axios.get(githubUrl + username)
    .then(function (user) {
      return user.data;
    });
}

const getRepos = (username) => {
  return axios.get(githubUrl + username + '/repos');
};

const getStarCount = (repos) => {
  return repos.data.reduce((count, repo) => {
    return count + repo.stargazers_count;
  }, 0);
};

const calculateScore = (profile, repos) => {
  var followers = profile.followers;
  var totalStars = getStarCount(repos);

  return (followers * 3) + totalStars;
};

const handleError = (error) => {
  console.warn(error);
  return null;
};

function getUserData(player) {
  return axios.all([
    getProfile(player),
    getRepos(player)
  ]).then(function (data) {
    var profile = data[0];
    var repos = data[1];

    return {
      profile: profile,
      score: calculateScore(profile, repos)
    };
  });
}

function sortPlayers(players) {
  return players.sort(function (a, b) {
    return b.score - a.score;
  });
}

module.exports = {
  battle: function (players) {
    return axios.all(players.map(getUserData))
      .then(sortPlayers)
      .catch(handleError);
  },
  fetchPopularRepos: function (language) {
    var encodedURI =
      window.encodeURI('https://api.github.com/search/repositories?q=stars:>1+language:'
        + language
        + '&sort=stars&order=desc&type=Repositories');

    return axios.get(encodedURI)
      .then(function (response) {
        return response.data.items;
      });
  }
}