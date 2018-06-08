const program = require('commander');
const octokit = require('@octokit/rest');
const QueryBuilder = require('./QueryBuilder.js');
const flat = require('flatten-array');
const fs = require('fs');
const client = octokit();


program.version('0.1.0')
       .option("-t, --token [token]", "Github token")
       .option("-o, --output [output]", "CSV Output")
       .parse(process.argv);

if(program.token){
  console.log(program.token);
  client.authenticate({
    type:'token',
    token: program.token
  })
}

GetFamousRepos().then((famousRepos) => {
  return GetStargazers(famousRepos);

}).then((stargazers) => {
  let flattenStargazers = flat(stargazers);

  flattenStargazers = flattenStargazers.map((stargazers) => {
    return {login: stargazers.user.login, profile: stargazers.user.html_url};
  });

  return flattenStargazers;
}).then((stargazers) => {
  if(program.output){
    CreateCSV(stargazers, program.output);
  }else{
    CreateCSV(stargazers);
  }
});

async function GetFamousRepos() {
  const result = await client.search.repos({
    q: QueryBuilder.GetSearchQuery({languages: ["javascript", "csharp"], created:QueryBuilder.GreaterThan('2018-05-05')}),
    sort: "stars",
    order: "desc"
  });
  return result.data.items;
}

function GetStargazers(repos){
  let stargazers = [];
  stargazers = Promise.all(repos.map(async (repo) => {
    let result = await client.activity.getStargazersForRepo({
      owner: repo.owner.login,
      repo: repo.name
    });
    return result.data;
  }));

  console.log("--------------------stargazers----------------");
  return stargazers;
}

function CreateCSV(array, output = "./test.csv"){
  console.log(array);
  let csv = "";
  array.forEach((row) => {
    console.log(row);
    csv += `${row.login};${row.profile};\n`;
  });

  console.log(csv);
  fs.writeFile(output, csv, (err) => {
    if(err){
      return console.log(err);
    }
    console.log(output);
  });
}
